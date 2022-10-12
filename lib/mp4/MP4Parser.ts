import { BasicParser } from "../common/BasicParser";
import { toHexString } from "../compat/hex";
import { decodeLatin1, decodeUtf8 } from "../compat/text-decoder";
import initDebug from "../debug";
import { Genres } from "../id3v1/ID3v1Genres";
import { mp4AtomData } from "../parse-unit/mp4/atom-data";
import { mp4atomFtyp } from "../parse-unit/mp4/atom-ftyp";
import { mp4AtomMdhd } from "../parse-unit/mp4/atom-mdhd";
import { mp4AtomMvhd } from "../parse-unit/mp4/atom-mvhd";
import { mp4AtomName } from "../parse-unit/mp4/atom-name";
import { mp4AtomStco } from "../parse-unit/mp4/atom-stco";
import { mp4AtomStsc } from "../parse-unit/mp4/atom-stsc";
import { mp4AtomStsd } from "../parse-unit/mp4/atom-stsd";
import { mp4AtomStsz } from "../parse-unit/mp4/atom-stsz";
import { mp4AtomStts } from "../parse-unit/mp4/atom-stts";
import { Mp4AtomTkhd, mp4AtomTkhd } from "../parse-unit/mp4/atom-tkhd";
import { mp4AtomHeader } from "../parse-unit/mp4/header";
import { mp4SoundSampleDescriptionVersion } from "../parse-unit/mp4/sound-sample-description-version";
import { mp4SoundSampleDescriptionVersion0 } from "../parse-unit/mp4/sound-sample-description-version0";
import { bytes } from "../parse-unit/primitive/bytes";
import { i8, i16be, i24be, i32be, i64be, u8, u16be, u24be, u32be, u64be } from "../parse-unit/primitive/integer";
import { utf8 } from "../parse-unit/primitive/string";
import { val } from "../parse-unit/primitive/value";
import { peekUnitFromTokenizer, readUnitFromBuffer, readUnitFromTokenizer } from "../parse-unit/utility/read-unit";
import { IChapter, ITrackInfo, TrackType } from "../type";

import { Atom } from "./Atom";
import { encoderDict } from "./encoder";

import type { SampleDescription } from "../parse-unit/mp4/entry-sample-description";
import type { SampleToChunk } from "../parse-unit/mp4/entry-sample-to-chunk";
import type { TimeToSample } from "../parse-unit/mp4/entry-time-to-sample";
import type { Unit } from "../parse-unit/type/unit";

const debug = initDebug("music-metadata:parser:MP4");
const tagFormat = "iTunes";

interface ISoundSampleDescription {
  dataFormat: string;
  dataReferenceIndex: number;
  description?: {
    numAudioChannels?: number;
    /**
     * Number of bits in each uncompressed sound sample
     */
    sampleSize?: number;
    /**
     * Compression ID
     */
    compressionId?: number;
    packetSize?: number;
    sampleRate?: number;
  };
}

interface ITrackDescription extends Mp4AtomTkhd {
  soundSampleDescription: ISoundSampleDescription[];
  timeScale: number;
  chapterList?: number[];
  chunkOffsetTable?: number[];
  sampleSize?: number;
  sampleSizeTable?: number[];
  sampleToChunkTable?: SampleToChunk[];
  timeToSampleTable?: TimeToSample[];
}

type IAtomParser = (payloadLength: number) => Promise<any>;

/**
 *
 * @param array
 * @returns
 */
function uniqueArray<T>(array: T[]): T[] {
  return [...new Set(array)];
}

/*
 * Parser for the MP4 (MPEG-4 Part 14) container format
 * Standard: ISO/IEC 14496-14
 * supporting:
 * - QuickTime container
 * - MP4 File Format
 * - 3GPP file format
 * - 3GPP2 file format
 *
 * MPEG-4 Audio / Part 3 (.m4a)& MPEG 4 Video (m4v, mp4) extension.
 * Support for Apple iTunes tags as found in a M4A/M4V files.
 * Ref:
 *   https://en.wikipedia.org/wiki/ISO_base_media_file_format
 *   https://developer.apple.com/library/archive/documentation/QuickTime/QTFF/Metadata/Metadata.html
 *   http://atomicparsley.sourceforge.net/mpeg-4files.html
 *   https://github.com/sergiomb2/libmp4v2/wiki/iTunesMetadata
 *   https://wiki.multimedia.cx/index.php/QuickTime_container
 */
export class MP4Parser extends BasicParser {
  private static intBe(length: number): Unit<number | bigint, RangeError> {
    return (
      { 1: i8, 2: i16be, 3: i24be, 4: i32be, 8: i64be }[length] ??
      val(new Error(`Token for integer type not found: "i${length * 8}${length > 1 ? "be" : ""}"`))
    );
  }

  private static uintBe(length: number): Unit<number | bigint, RangeError> {
    return (
      { 1: u8, 2: u16be, 3: u24be, 4: u32be, 8: u64be }[length] ??
      val(new Error(`Token for integer type not found: "u${length * 8}${length > 1 ? "be" : ""}"`))
    );
  }

  private audioLengthInBytes: number;
  private tracks: ITrackDescription[];

  public async parse(): Promise<void> {
    this.tracks = [];

    let remainingFileSize = this.tokenizer.fileInfo.size;

    while (this.tokenizer.fileInfo.size === undefined || this.tokenizer.fileInfo.size === 0 || remainingFileSize > 0) {
      try {
        const token = await peekUnitFromTokenizer(this.tokenizer, mp4AtomHeader);
        if (token.name === "\0\0\0\0") {
          const errMsg = `Error at offset=${this.tokenizer.position}: box.id=0`;
          debug(errMsg);
          this.addWarning(errMsg);
          break;
        }
      } catch (error) {
        if (!(error instanceof Error)) {
          throw error;
        }
        const errMsg = `Error at offset=${this.tokenizer.position}: ${error.message}`;
        debug(errMsg);
        this.addWarning(errMsg);
        break;
      }
      const rootAtom = await Atom.readAtom(
        this.tokenizer,
        (atom, remaining) => this.handleAtom(atom, remaining),
        null,
        remainingFileSize
      );
      remainingFileSize -= rootAtom.header.length === BigInt(0) ? remainingFileSize : Number(rootAtom.header.length);
    }

    // Post process metadata
    const formatList: string[] = [];
    for (const track of this.tracks) {
      const trackFormats: string[] = [];

      for (const ssd of track.soundSampleDescription) {
        const streamInfo: ITrackInfo = {};
        const encoderInfo = encoderDict[ssd.dataFormat];
        if (encoderInfo) {
          trackFormats.push(encoderInfo.format);
          streamInfo.codecName = encoderInfo.format;
        } else {
          streamInfo.codecName = `<${ssd.dataFormat}>`;
        }
        if (ssd.description) {
          const { description } = ssd;
          if (description.sampleRate > 0) {
            streamInfo.type = TrackType.audio;
            streamInfo.audio = {
              samplingFrequency: description.sampleRate,
              bitDepth: description.sampleSize,
              channels: description.numAudioChannels,
            };
          }
        }
        this.metadata.addStreamInfo(streamInfo);
      }

      if (trackFormats.length > 0) {
        formatList.push(trackFormats.join("/"));
      }
    }

    if (formatList.length > 0) {
      this.metadata.setFormat("codec", uniqueArray(formatList).join("+"));
    }

    const audioTracks = this.tracks.filter((track) => {
      return (
        track.soundSampleDescription.length > 0 &&
        track.soundSampleDescription[0].description &&
        track.soundSampleDescription[0].description.numAudioChannels > 0
      );
    });

    if (audioTracks.length > 0) {
      const audioTrack = audioTracks[0];

      const duration = audioTrack.duration / audioTrack.timeScale;
      this.metadata.setFormat("duration", duration); // calculate duration in seconds

      const ssd = audioTrack.soundSampleDescription[0];
      if (ssd.description) {
        this.metadata.setFormat("sampleRate", ssd.description.sampleRate);
        this.metadata.setFormat("bitsPerSample", ssd.description.sampleSize);
        this.metadata.setFormat("numberOfChannels", ssd.description.numAudioChannels);
      }
      const encoderInfo = encoderDict[ssd.dataFormat];
      if (encoderInfo) {
        this.metadata.setFormat("lossless", !encoderInfo.lossy);
      }

      this.calculateBitRate();
    }
  }

  public async handleAtom(atom: Atom, remaining: number): Promise<void> {
    if (atom.parent) {
      switch (atom.parent.header.name) {
        case "ilst":
        case "<id>":
          return this.parseMetadataItemData(atom);
      }
    }

    // const payloadLength = atom.getPayloadLength(remaining);

    if (this.atomParsers[atom.header.name]) {
      return this.atomParsers[atom.header.name](remaining);
    } else {
      debug(`No parser for atom path=${atom.atomPath}, payload-len=${remaining}, ignoring atom`);
      await this.tokenizer.ignore(remaining);
    }
  }

  private getTrackDescription(): ITrackDescription {
    return this.tracks[this.tracks.length - 1];
  }

  private calculateBitRate() {
    if (this.audioLengthInBytes && this.metadata.format.duration) {
      this.metadata.setFormat("bitrate", (8 * this.audioLengthInBytes) / this.metadata.format.duration);
    }
  }

  private addTag(id: string, value: any) {
    this.metadata.addTag(tagFormat, id, value);
  }

  private addWarning(message: string) {
    debug("Warning: " + message);
    this.metadata.addWarning(message);
  }

  /**
   * Parse data of Meta-item-list-atom (item of 'ilst' atom)
   * Ref: https://developer.apple.com/library/content/documentation/QuickTime/QTFF/Metadata/Metadata.html#//apple_ref/doc/uid/TP40000939-CH1-SW8
   * @param metaAtom
   * @returns
   */
  private parseMetadataItemData(metaAtom: Atom): Promise<void> {
    let tagKey = metaAtom.header.name;

    return metaAtom.readAtoms(
      this.tokenizer,
      async (child, remaining) => {
        const payLoadLength = child.getPayloadLength(remaining);
        switch (child.header.name) {
          case "data": // value atom
            return this.parseValueAtom(tagKey, child);

          case "name":
          case "mean": {
            // name atom (optional)
            const name = await readUnitFromTokenizer(this.tokenizer, mp4AtomName(payLoadLength));
            // console.log("  %s[%s] = %s", tagKey, header.name, mean.name);
            tagKey += ":" + name.name;
            break;
          }

          default: {
            const dataAtom = await readUnitFromTokenizer(this.tokenizer, bytes(payLoadLength));
            this.addWarning(
              "Unsupported meta-item: " +
                tagKey +
                "[" +
                child.header.name +
                "] => value=" +
                toHexString(dataAtom) +
                " ascii=" +
                decodeLatin1(dataAtom)
            );
          }
        }
      },
      metaAtom.getPayloadLength(0)
    );
  }

  private async parseValueAtom(tagKey: string, metaAtom: Atom): Promise<void> {
    const dataAtom = await readUnitFromTokenizer(
      this.tokenizer,
      mp4AtomData(Number(metaAtom.header.length) - mp4AtomHeader[0])
    );

    if (dataAtom.type !== 0) {
      throw new Error(`Unsupported type-set != 0: ${dataAtom.type}`);
    }

    // Use well-known-type table
    // Ref: https://developer.apple.com/library/content/documentation/QuickTime/QTFF/Metadata/Metadata.html#//apple_ref/doc/uid/TP40000939-CH1-SW35
    switch (dataAtom.wellKnownType) {
      case 0: // reserved: Reserved for use where no type needs to be indicated
        switch (tagKey) {
          case "trkn":
          case "disk": {
            const num = readUnitFromBuffer(u8, dataAtom.value, 3);
            const of = readUnitFromBuffer(u8, dataAtom.value, 5);
            // console.log("  %s[data] = %s/%s", tagKey, num, of);
            this.addTag(tagKey, `${num}/${of}`);
            break;
          }
          case "gnre": {
            const genreInt = readUnitFromBuffer(u8, dataAtom.value, 1);
            const genreStr = Genres[genreInt - 1];
            // console.log("  %s[data] = %s", tagKey, genreStr);
            this.addTag(tagKey, genreStr);
            break;
          }
          default:
          // console.log("  reserved-data: name=%s, len=%s, set=%s, type=%s, locale=%s, value{ hex=%s, ascii=%s }",
          // header.name, header.length, dataAtom.type.set, dataAtom.type.type, dataAtom.locale, dataAtom.value.toString('hex'), dataAtom.value.toString('ascii'));
        }
        break;

      case 1: // UTF-8: Without any count or NULL terminator
      case 18: // Unknown: Found in m4b in combination with a '©gen' tag
        this.addTag(tagKey, decodeUtf8(dataAtom.value));
        break;

      case 13: // JPEG
        if (this.options.skipCovers) break;
        this.addTag(tagKey, {
          format: "image/jpeg",
          data: new Uint8Array(dataAtom.value),
        });
        break;

      case 14: // PNG
        if (this.options.skipCovers) break;
        this.addTag(tagKey, {
          format: "image/png",
          data: new Uint8Array(dataAtom.value),
        });
        break;

      case 21: // BE Signed Integer
        this.addTag(tagKey, readUnitFromBuffer(MP4Parser.intBe(dataAtom.value.length), dataAtom.value, 0));
        break;

      case 22: // BE Unsigned Integer
        this.addTag(tagKey, readUnitFromBuffer(MP4Parser.uintBe(dataAtom.value.length), dataAtom.value, 0));
        break;

      case 65: // An 8-bit signed integer
        this.addTag(tagKey, readUnitFromBuffer(i8, dataAtom.value, 0));
        break;

      case 66: // A big-endian 16-bit signed integer
        this.addTag(tagKey, readUnitFromBuffer(i16be, dataAtom.value, 0));
        break;

      case 67: // A big-endian 32-bit signed integer
        this.addTag(tagKey, readUnitFromBuffer(i32be, dataAtom.value, 0));
        break;

      default:
        this.addWarning(`atom key=${tagKey}, has unknown well-known-type (data-type): ${dataAtom.wellKnownType}`);
    }
  }

  private atomParsers: Record<string, IAtomParser> = {
    /**
     * Parse movie header (mvhd) atom
     * Ref: https://developer.apple.com/library/archive/documentation/QuickTime/QTFF/QTFFChap2/qtff2.html#//apple_ref/doc/uid/TP40000939-CH204-56313
     * @param len
     */
    mvhd: async (len: number) => {
      const mvhd = await readUnitFromTokenizer(this.tokenizer, mp4AtomMvhd(len));
      this.metadata.setFormat("creationTime", mvhd.creationTime);
      this.metadata.setFormat("modificationTime", mvhd.modificationTime);
    },

    /**
     * Parse media header (mdhd) atom
     * Ref: https://developer.apple.com/library/archive/documentation/QuickTime/QTFF/QTFFChap2/qtff2.html#//apple_ref/doc/uid/TP40000939-CH204-25615
     * @param len
     */
    mdhd: async (len: number) => {
      const mdhd_data = await readUnitFromTokenizer(this.tokenizer, mp4AtomMdhd(len));
      // this.parse_mxhd(mdhd_data, this.currentTrack);
      const td = this.getTrackDescription();
      td.creationTime = mdhd_data.creationTime;
      td.modificationTime = mdhd_data.modificationTime;
      td.timeScale = mdhd_data.timeScale;
      td.duration = mdhd_data.duration;
    },

    chap: async (len: number) => {
      const td = this.getTrackDescription();

      const trackIds: number[] = [];
      while (len >= u32be[0]) {
        trackIds.push(await readUnitFromTokenizer(this.tokenizer, u32be));
        len -= u32be[0];
      }

      td.chapterList = trackIds;
    },

    tkhd: async (len: number) => {
      const track = (await readUnitFromTokenizer(this.tokenizer, mp4AtomTkhd(len))) as ITrackDescription;
      this.tracks.push(track);
    },

    /**
     * Parse mdat atom.
     * Will scan for chapters
     * @param len
     */
    mdat: async (len: number) => {
      this.audioLengthInBytes = len;
      this.calculateBitRate();

      if (this.options.includeChapters) {
        const trackWithChapters = this.tracks.filter((track) => track.chapterList);
        if (trackWithChapters.length === 1) {
          const chapterTrackIds = trackWithChapters[0].chapterList;
          const chapterTracks = this.tracks.filter((track) => chapterTrackIds.includes(track.trackId));
          if (chapterTracks.length === 1) {
            return this.parseChapterTrack(chapterTracks[0], trackWithChapters[0], len);
          }
        }
      }
      await this.tokenizer.ignore(len);
    },

    ftyp: async (len: number) => {
      const ftyp = await readUnitFromTokenizer(this.tokenizer, mp4atomFtyp(len));
      debug(`ftyp: ${ftyp.join("/")}`);
      const x = uniqueArray(ftyp.map((v) => v.replace(/\W/g, "")).filter(Boolean)).join("/");
      this.metadata.setFormat("container", x);
    },

    /**
     * Parse sample description atom
     * @param len
     */
    stsd: async (len: number) => {
      const stsd = await readUnitFromTokenizer(this.tokenizer, mp4AtomStsd(len));
      const trackDescription = this.getTrackDescription();
      trackDescription.soundSampleDescription = stsd.entries.map((entry) => this.parseSoundSampleDescription(entry));
    },

    /**
     * sample-to-Chunk Atoms
     * @param len
     */
    stsc: async (len: number) => {
      const stsc = await readUnitFromTokenizer(this.tokenizer, mp4AtomStsc(len));
      this.getTrackDescription().sampleToChunkTable = stsc.entries;
    },

    /**
     * time to sample
     * @param len
     */
    stts: async (len: number) => {
      const stts = await readUnitFromTokenizer(this.tokenizer, mp4AtomStts(len));
      this.getTrackDescription().timeToSampleTable = stts.entries;
    },

    /**
     * Parse sample-sizes atom ('stsz')
     * @param len
     */
    stsz: async (len: number) => {
      const stsz = await readUnitFromTokenizer(this.tokenizer, mp4AtomStsz(len));
      const td = this.getTrackDescription();
      td.sampleSize = stsz.sampleSize;
      td.sampleSizeTable = stsz.entries;
    },

    /**
     * Parse chunk-offset atom ('stco')
     * @param len
     */
    stco: async (len: number) => {
      const stco = await readUnitFromTokenizer(this.tokenizer, mp4AtomStco(len));
      this.getTrackDescription().chunkOffsetTable = stco.entries; // remember chunk offsets
    },

    date: async (len: number) => {
      const date = await readUnitFromTokenizer(this.tokenizer, utf8(len));
      this.addTag("date", date);
    },
  };

  /**
   * Ref: https://developer.apple.com/library/archive/documentation/QuickTime/QTFF/QTFFChap3/qtff3.html#//apple_ref/doc/uid/TP40000939-CH205-128916
   * @param sampleDescription
   * @returns
   */
  private parseSoundSampleDescription(sampleDescription: SampleDescription): ISoundSampleDescription {
    const ssd: ISoundSampleDescription = {
      dataFormat: sampleDescription.dataFormat,
      dataReferenceIndex: sampleDescription.dataReferenceIndex,
    };

    let offset = 0;
    const version = readUnitFromBuffer(mp4SoundSampleDescriptionVersion, sampleDescription.description, offset);
    offset += mp4SoundSampleDescriptionVersion[0];

    if (version.version === 0 || version.version === 1) {
      // Sound Sample Description (Version 0)
      ssd.description = readUnitFromBuffer(mp4SoundSampleDescriptionVersion0, sampleDescription.description, offset);
    } else {
      debug(`Warning: sound-sample-description ${version as unknown as string} not implemented`);
    }
    return ssd;
  }

  private async parseChapterTrack(
    chapterTrack: ITrackDescription,
    track: ITrackDescription,
    len: number
  ): Promise<void> {
    if (!chapterTrack.sampleSize && chapterTrack.chunkOffsetTable.length !== chapterTrack.sampleSizeTable.length) {
      throw new Error("Expected equal chunk-offset-table & sample-size-table length.");
    }
    const chapters: IChapter[] = [];
    for (let i = 0; i < chapterTrack.chunkOffsetTable.length && len > 0; ++i) {
      const chunkOffset = chapterTrack.chunkOffsetTable[i];
      const nextChunkLen = chunkOffset - this.tokenizer.position;
      const sampleSize = chapterTrack.sampleSize > 0 ? chapterTrack.sampleSize : chapterTrack.sampleSizeTable[i];
      len -= nextChunkLen + sampleSize;
      if (len < 0) throw new Error("Chapter chunk exceeding token length");
      await this.tokenizer.ignore(nextChunkLen);
      // chapter text
      const titleLen = await readUnitFromTokenizer(this.tokenizer, u16be);
      const title = await readUnitFromTokenizer(this.tokenizer, utf8(Math.min(titleLen, sampleSize - 2)));
      if (titleLen < sampleSize - 2) {
        await this.tokenizer.ignore(sampleSize - titleLen - 2);
      }
      //
      debug(`Chapter ${i + 1}: ${title}`);
      const chapter = {
        title,
        sampleOffset: this.findSampleOffset(track, this.tokenizer.position),
      };
      debug(`Chapter title=${chapter.title}, offset=${chapter.sampleOffset}/${this.tracks[0].duration}`);
      chapters.push(chapter);
    }
    this.metadata.setFormat("chapters", chapters);
    await this.tokenizer.ignore(len);
  }

  private findSampleOffset(track: ITrackDescription, chapterOffset: number): number {
    let totalDuration = 0;
    for (const e of track.timeToSampleTable) {
      totalDuration += e.count * e.duration;
    }
    debug(`Total duration=${totalDuration}`);

    let chunkIndex = 0;
    while (chunkIndex < track.chunkOffsetTable.length && track.chunkOffsetTable[chunkIndex] < chapterOffset) {
      ++chunkIndex;
    }

    return this.getChunkDuration(chunkIndex + 1, track);
  }

  private getChunkDuration(chunkId: number, track: ITrackDescription): number {
    let ttsi = 0;
    let ttsc = track.timeToSampleTable[ttsi].count;
    let ttsd = track.timeToSampleTable[ttsi].duration;
    let curChunkId = 1;
    let samplesPerChunk = this.getSamplesPerChunk(curChunkId, track.sampleToChunkTable);
    let totalDuration = 0;
    while (curChunkId < chunkId) {
      const nrOfSamples = Math.min(ttsc, samplesPerChunk);
      totalDuration += nrOfSamples * ttsd;
      ttsc -= nrOfSamples;
      samplesPerChunk -= nrOfSamples;
      if (samplesPerChunk === 0) {
        ++curChunkId;
        samplesPerChunk = this.getSamplesPerChunk(curChunkId, track.sampleToChunkTable);
      } else {
        ++ttsi;
        ttsc = track.timeToSampleTable[ttsi].count;
        ttsd = track.timeToSampleTable[ttsi].duration;
      }
    }
    return totalDuration;
  }

  private getSamplesPerChunk(chunkId: number, stcTable: SampleToChunk[]): number {
    for (let i = 0; i < stcTable.length - 1; ++i) {
      if (chunkId >= stcTable[i].firstChunk && chunkId < stcTable[i + 1].firstChunk) {
        return stcTable[i].samplesPerChunk;
      }
    }
    return stcTable[stcTable.length - 1].samplesPerChunk;
  }
}
