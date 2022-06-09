import initDebug from "debug";

import { BasicParser } from "../common/BasicParser";
import { TrackType } from "../type";

import {
  TopLevelHeaderObjectToken,
  HeaderObjectToken,
  FilePropertiesObject,
  StreamPropertiesObject,
  HeaderExtensionObject,
  ContentDescriptionObjectState,
  ExtendedContentDescriptionObjectState,
  readCodecEntries,
  IgnoreObjectState,
  ExtendedStreamPropertiesObjectState,
  MetadataObjectState,
  MetadataLibraryObjectState,
} from "./AsfObject";
import GUID from "./GUID";

import type { ITag } from "../type";
import type {
  IAsfTopLevelObjectHeader,
  IAsfObjectHeader,
  IFilePropertiesObject,
  IStreamPropertiesObject,
  IHeaderExtensionObject,
  IExtendedStreamPropertiesObject,
} from "./AsfObject";

const debug = initDebug("music-metadata:parser:ASF");
const headerType = "asf";

/**
 * Windows Media Metadata Usage Guidelines
 * - Ref: https://msdn.microsoft.com/en-us/library/ms867702.aspx
 *
 * Ref:
 * - https://tools.ietf.org/html/draft-fleischman-asf-01
 * - https://hwiegman.home.xs4all.nl/fileformats/asf/ASF_Specification.pdf
 * - http://drang.s4.xrea.com/program/tips/id3tag/wmp/index.html
 * - https://msdn.microsoft.com/en-us/library/windows/desktop/ee663575(v=vs.85).aspx
 */
export class AsfParser extends BasicParser {
  public async parse() {
    const header = await this.tokenizer.readToken<IAsfTopLevelObjectHeader>(
      TopLevelHeaderObjectToken
    );
    if (!header.objectId.equals(GUID.HeaderObject)) {
      throw new Error(
        "expected asf header; but was not found; got: " + header.objectId.str
      );
    }
    try {
      await this.parseObjectHeader(header.numberOfHeaderObjects);
    } catch (err) {
      debug("Error while parsing ASF: %s", err);
    }
  }

  private async parseObjectHeader(
    numberOfObjectHeaders: number
  ): Promise<void> {
    let tags: ITag[];
    do {
      // Parse common header of the ASF Object (3.1)
      const header = await this.tokenizer.readToken<IAsfObjectHeader>(
        HeaderObjectToken
      );
      // Parse data part of the ASF Object
      debug("header GUID=%s", header.objectId.str);
      switch (header.objectId.str) {
        case FilePropertiesObject.guid.str: // 3.2
          this.parseFilePropertiesObject(header);
          break;

        case StreamPropertiesObject.guid.str: // 3.3
          this.parseStreamPropertiesObjectHeader(header);
          break;

        case HeaderExtensionObject.guid.str: // 3.4
          this.parseHeaderExtensionObjectHeader();
          break;

        case ContentDescriptionObjectState.guid.str: // 3.10
          tags = await this.tokenizer.readToken<ITag[]>(
            new ContentDescriptionObjectState(header)
          );
          this.addTags(tags);
          break;

        case ExtendedContentDescriptionObjectState.guid.str: // 3.11
          tags = await this.tokenizer.readToken<ITag[]>(
            new ExtendedContentDescriptionObjectState(header)
          );
          this.addTags(tags);
          break;

        case GUID.CodecListObject.str:
          const codecs = await readCodecEntries(this.tokenizer);
          codecs.forEach((codec) => {
            this.metadata.addStreamInfo({
              type: codec.type.videoCodec ? TrackType.video : TrackType.audio,
              codecName: codec.codecName,
            });
          });
          const audioCodecs = codecs
            .filter((codec) => codec.type.audioCodec)
            .map((codec) => codec.codecName)
            .join("/");
          this.metadata.setFormat("codec", audioCodecs);
          break;

        case GUID.StreamBitratePropertiesObject.str:
          // ToDo?
          await this.tokenizer.ignore(
            header.objectSize - HeaderObjectToken.len
          );
          break;

        case GUID.PaddingObject.str:
          // ToDo: register bytes pad
          debug("Padding: %s bytes", header.objectSize - HeaderObjectToken.len);
          await this.tokenizer.ignore(
            header.objectSize - HeaderObjectToken.len
          );
          break;

        default:
          this.metadata.addWarning(
            "Ignore ASF-Object-GUID: " + header.objectId.str
          );
          debug("Ignore ASF-Object-GUID: %s", header.objectId.str);
          await this.tokenizer.readToken<void>(new IgnoreObjectState(header));
      }
    } while (--numberOfObjectHeaders);
    // done
  }

  private async parseFilePropertiesObject(
    header: IAsfObjectHeader
  ): Promise<void> {
    const fpo = await this.tokenizer.readToken<IFilePropertiesObject>(
      new FilePropertiesObject(header)
    );
    this.metadata.setFormat(
      "duration",
      Number(fpo.playDuration / BigInt(1000)) / 10000 -
        Number(fpo.preroll) / 1000
    );
    this.metadata.setFormat("bitrate", fpo.maximumBitrate);
  }

  private async parseStreamPropertiesObjectHeader(
    header: IAsfObjectHeader
  ): Promise<void> {
    const spo = await this.tokenizer.readToken<IStreamPropertiesObject>(
      new StreamPropertiesObject(header)
    );
    this.metadata.setFormat("container", "ASF/" + spo.streamType);
  }

  private async parseHeaderExtensionObjectHeader(): Promise<void> {
    const extHeader = await this.tokenizer.readToken<IHeaderExtensionObject>(
      new HeaderExtensionObject()
    );
    await this.parseExtensionObject(extHeader.extensionDataSize);
  }

  ASFIndexPlaceholderObject: object | null = null;

  private addTags(tags: ITag[]) {
    tags.forEach((tag) => {
      this.metadata.addTag(headerType, tag.id, tag.value);
    });
  }

  private async parseExtensionObject(extensionSize: number): Promise<void> {
    do {
      // Parse common header of the ASF Object (3.1)
      const header = await this.tokenizer.readToken<IAsfObjectHeader>(
        HeaderObjectToken
      );
      const remaining = header.objectSize - HeaderObjectToken.len;
      // Parse data part of the ASF Object
      switch (header.objectId.str) {
        case ExtendedStreamPropertiesObjectState.guid.str: // 4.1
          // ToDo: extended stream header properties are ignored
          await this.tokenizer.readToken<IExtendedStreamPropertiesObject>(
            new ExtendedStreamPropertiesObjectState(header)
          );
          break;

        case MetadataObjectState.guid.str: // 4.7
          const moTags = await this.tokenizer.readToken<ITag[]>(
            new MetadataObjectState(header)
          );
          this.addTags(moTags);
          break;

        case MetadataLibraryObjectState.guid.str: // 4.8
          const mlTags = await this.tokenizer.readToken<ITag[]>(
            new MetadataLibraryObjectState(header)
          );
          this.addTags(mlTags);
          break;

        case GUID.PaddingObject.str:
          // ToDo: register bytes pad
          await this.tokenizer.ignore(remaining);
          break;

        case GUID.CompatibilityObject.str:
          this.tokenizer.ignore(remaining);
          break;

        case GUID.ASFIndexPlaceholderObject.str:
          await this.tokenizer.ignore(remaining);
          break;

        default:
          this.metadata.addWarning(
            "Ignore ASF-Object-GUID: " + header.objectId.str
          );
          // console.log("Ignore ASF-Object-GUID: %s", header.objectId.str);
          await this.tokenizer.readToken<void>(new IgnoreObjectState(header));
          break;
      }
      extensionSize -= header.objectSize;
    } while (extensionSize > 0);
  }
}
