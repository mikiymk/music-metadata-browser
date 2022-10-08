import initDebug from "../debug";
import { AbstractID3Parser } from "../id3v2/AbstractID3Parser";
import { VorbisDecoder } from "../ogg/vorbis/VorbisDecoder";
import { VorbisParser } from "../ogg/vorbis/VorbisParser";
import { FlacBlockHeader, flacBlockHeader } from "../parse-unit/flac/block-header";
import { flacBlockPicture } from "../parse-unit/flac/block-picture";
import { flacBlockStreaminfo } from "../parse-unit/flac/block-streaminfo";
import { fourCc } from "../parse-unit/iff/four-cc";
import { bytes } from "../parse-unit/primitive/bytes";
import { readUnitFromTokenizer } from "../parse-unit/utility/read-unit";

import type { INativeMetadataCollector } from "../common/INativeMetadataCollector";
import type { ITokenParser } from "../ParserFactory";
import type { ITokenizer } from "../strtok3/types";
import type { IOptions } from "../type";

const debug = initDebug("music-metadata:parser:FLAC");

export class FlacParser extends AbstractID3Parser {
  private vorbisParser: VorbisParser;

  /**
   * Initialize parser with output (metadata), input (tokenizer) & parsing options (options).
   * @param {INativeMetadataCollector} metadata Output
   * @param {ITokenizer} tokenizer Input
   * @param {IOptions} options Parsing options
   * @returns
   */
  public override init(metadata: INativeMetadataCollector, tokenizer: ITokenizer, options: IOptions): ITokenParser {
    super.init(metadata, tokenizer, options);
    this.vorbisParser = new VorbisParser(metadata, options);
    return this;
  }

  public async postId3v2Parse(): Promise<void> {
    const fourCC = await readUnitFromTokenizer(this.tokenizer, fourCc);
    if (fourCC.toString() !== "fLaC") {
      throw new Error("Invalid FLAC preamble");
    }

    let blockHeader: FlacBlockHeader;
    do {
      // Read block header
      blockHeader = await readUnitFromTokenizer(this.tokenizer, flacBlockHeader);
      // Parse block data
      await this.parseDataBlock(blockHeader);
    } while (!blockHeader.lastBlock);

    if (this.tokenizer.fileInfo.size > 0 && this.metadata.format.duration) {
      const dataSize = this.tokenizer.fileInfo.size - this.tokenizer.position;
      this.metadata.setFormat("bitrate", (8 * dataSize) / this.metadata.format.duration);
    }
  }

  private async parseDataBlock(blockHeader: FlacBlockHeader): Promise<void> {
    debug(`blockHeader type=${blockHeader.type}, length=${blockHeader.length}`);
    switch (blockHeader.type) {
      case 0: // Metadata Block Stream Info
        return this.parseBlockStreamInfo(blockHeader.length);

      case 4: // // Metadata Block Vorbis Comment
        return this.parseComment(blockHeader.length);

      case 6: // Metadata Block Picture
        return this.parsePicture(blockHeader.length);

      case 1: // Metadata Block Padding
      case 2: // Metadata Block Application
      case 3: // Metadata Block Seek Table
      case 5: // Metadata Block Cue Sheet
        break;

      default:
        this.metadata.addWarning(`Unknown block type: ${blockHeader.type}`);
    }
    // Ignore data block
    await this.tokenizer.ignore(blockHeader.length);
  }

  /**
   * Parse STREAMINFO
   * @param dataLen
   */
  private async parseBlockStreamInfo(dataLen: number): Promise<void> {
    if (dataLen !== flacBlockStreaminfo[0]) throw new Error("Unexpected block-stream-info length");

    const streamInfo = await readUnitFromTokenizer(this.tokenizer, flacBlockStreaminfo);
    this.metadata.setFormat("container", "FLAC");
    this.metadata.setFormat("codec", "FLAC");
    this.metadata.setFormat("lossless", true);
    this.metadata.setFormat("numberOfChannels", streamInfo.channels);
    this.metadata.setFormat("bitsPerSample", streamInfo.bitsPerSample);
    this.metadata.setFormat("sampleRate", streamInfo.sampleRate);
    if (streamInfo.totalSamples > 0) {
      this.metadata.setFormat("duration", streamInfo.totalSamples / streamInfo.sampleRate);
    }
  }

  /**
   * Parse VORBIS_COMMENT
   * Ref: https://www.xiph.org/vorbis/doc/Vorbis_I_spec.html#x1-640004.2.3
   * @param dataLen
   */
  private async parseComment(dataLen: number): Promise<void> {
    const data = await readUnitFromTokenizer(this.tokenizer, bytes(dataLen));
    const decoder = new VorbisDecoder(data, 0);
    decoder.readStringUtf8(); // vendor (skip)
    const commentListLength = decoder.readInt32();
    for (let i = 0; i < commentListLength; i++) {
      const tag = decoder.parseUserComment();
      this.vorbisParser.addTag(tag.key, tag.value);
    }
  }

  private async parsePicture(dataLen: number): Promise<void> {
    if (this.options.skipCovers) {
      await this.tokenizer.ignore(dataLen);
    } else {
      const picture = await readUnitFromTokenizer(this.tokenizer, flacBlockPicture(dataLen));
      this.vorbisParser.addTag("METADATA_BLOCK_PICTURE", picture);
    }
  }
}
