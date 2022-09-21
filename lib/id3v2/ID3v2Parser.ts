import { getBit } from "../common/Util";
import { decodeLatin1 } from "../compat/text-decoder";
import { readUint32be } from "../parser/base/unsigned-integer";
import { ID3V2_EXTENDED_HEADER_SIZE_SIZE, readId3v2ExtendedHeaderSize } from "../parser/part/id3v2/extended-header";
import { Id3v2Header, ID3V2_HEADER_SIZE, readId3v2Header } from "../parser/part/id3v2/header";
import { readSyncSafeUint32be } from "../parser/part/id3v2/syncsafe-integer";
import { readToken } from "../parser/token";
import { Uint8ArrayType, UINT24_BE } from "../token-types";

import { FrameParser } from "./FrameParser";

import type { TagType } from "../common/GenericTagTypes";
import type { INativeMetadataCollector, IWarningCollector } from "../common/INativeMetadataCollector";
import type { ITokenizer } from "../strtok3";
import type { ITag, IOptions } from "../type";
import type { ID3v2MajorVersion } from "./ID3v2MajorVersion";

interface IFrameFlags {
  status: {
    tag_alter_preservation: boolean;
    file_alter_preservation: boolean;
    read_only: boolean;
  };
  format: {
    grouping_identity: boolean;
    compression: boolean;
    encryption: boolean;
    unsynchronisation: boolean;
    data_length_indicator: boolean;
  };
}

interface IFrameHeader {
  id: string;
  length?: number;
  flags?: IFrameFlags;
}

export class ID3v2Parser {
  private tokenizer: ITokenizer;
  private id3Header: Id3v2Header;
  private metadata: INativeMetadataCollector;

  private headerType: TagType;
  private options: IOptions;

  public async parse(metadata: INativeMetadataCollector, tokenizer: ITokenizer, options: IOptions): Promise<void> {
    this.tokenizer = tokenizer;
    this.metadata = metadata;
    this.options = options;

    this.id3Header = await readToken(this.tokenizer, this.tokenizer.position, ID3V2_HEADER_SIZE, readId3v2Header);

    if (this.id3Header.id !== "ID3") {
      throw new Error("expected ID3-header file-identifier 'ID3' was not found");
    }
    if (![2, 3, 4].includes(this.id3Header.versionMajor))
      throw new Error(`header version ${this.id3Header.versionMajor} is incorrect`);

    this.headerType = `ID3v2.${this.id3Header.versionMajor}` as TagType;

    return this.id3Header.isExtendedHeader ? this.parseExtendedHeader() : this.parseId3Data(this.id3Header.size);
  }

  private async parseExtendedHeader(): Promise<void> {
    const extendedHeaderSize = await readToken(
      this.tokenizer,
      this.tokenizer.position,
      ID3V2_EXTENDED_HEADER_SIZE_SIZE,
      readId3v2ExtendedHeaderSize
    );

    const dataRemaining = extendedHeaderSize - ID3V2_EXTENDED_HEADER_SIZE_SIZE;
    if (dataRemaining > 0) await this.tokenizer.ignore(dataRemaining);
    return this.parseId3Data(this.id3Header.size - extendedHeaderSize);
  }

  private async parseId3Data(dataLen: number): Promise<void> {
    const uint8Array = await this.tokenizer.readToken(new Uint8ArrayType(dataLen));
    for (const tag of this.parseMetadata(uint8Array)) {
      switch (tag.id) {
        case "TXXX": {
          if (tag.value) {
            for (const text of tag.value.text) {
              this.addTag(makeDescriptionTagName(tag.id, tag.value.description as string), text);
            }
          }

          break;
        }
        case "COM": {
          for (const value of tag.value) {
            this.addTag(makeDescriptionTagName(tag.id, value.description as string), value.text);
          }

          break;
        }
        case "COMM": {
          for (const value of tag.value) {
            this.addTag(makeDescriptionTagName(tag.id, value.description as string), value);
          }

          break;
        }
        default:
          if (Array.isArray(tag.value)) {
            for (const value of tag.value) {
              this.addTag(tag.id, value);
            }
          } else {
            this.addTag(tag.id, tag.value);
          }
      }
    }
  }

  private addTag(id: string, value: any) {
    this.metadata.addTag(this.headerType, id, value);
  }

  private parseMetadata(data: Uint8Array): ITag[] {
    let offset = 0;
    const tags: { id: string; value: any }[] = [];

    while (true) {
      if (offset === data.length) break;

      const frameHeaderLength = getFrameHeaderLength(this.id3Header.versionMajor);

      if (offset + frameHeaderLength > data.length) {
        this.metadata.addWarning("Illegal ID3v2 tag length");
        break;
      }

      const frameHeaderBytes = data.slice(offset, (offset += frameHeaderLength));
      const frameHeader = this.readFrameHeader(frameHeaderBytes, this.id3Header.versionMajor);

      const frameDataBytes = data.slice(offset, (offset += frameHeader.length));
      const values = readFrameData(
        frameDataBytes,
        frameHeader,
        this.id3Header.versionMajor,
        !this.options.skipCovers,
        this.metadata
      );
      if (values) {
        tags.push({ id: frameHeader.id, value: values });
      }
    }
    return tags;
  }

  private readFrameHeader(uint8Array: Uint8Array, majorVer: ID3v2MajorVersion): IFrameHeader {
    let id: string;
    let length: number;
    let flags: IFrameFlags;
    switch (majorVer) {
      case 2:
        id = decodeLatin1(uint8Array.slice(0, 3));
        length = UINT24_BE.get(uint8Array, 3);

        if (!/[\dA-Z]{3}/g.test(id)) {
          this.metadata.addWarning(`Invalid ID3v2.${this.id3Header.versionMajor} frame-header-ID: ${id}`);
        }
        return { id, length };

      case 3:
      case 4:
        id = decodeLatin1(uint8Array.slice(0, 4));
        length = (majorVer === 4 ? readSyncSafeUint32be : readUint32be)(uint8Array, 4);
        flags = readFrameFlags(uint8Array.slice(8, 10));

        if (!/[\dA-Z]{4}/g.test(id)) {
          this.metadata.addWarning(`Invalid ID3v2.${this.id3Header.versionMajor} frame-header-ID: ${id}`);
        }
        return { id, length, flags };
    }
  }
}

export const removeUnsyncBytes = (buffer: Uint8Array): Uint8Array => {
  let readI = 0;
  let writeI = 0;
  while (readI < buffer.length - 1) {
    if (readI !== writeI) {
      buffer[writeI] = buffer[readI];
    }
    readI += buffer[readI] === 0xff && buffer[readI + 1] === 0 ? 2 : 1;
    writeI++;
  }
  if (readI < buffer.length) {
    buffer[writeI++] = buffer[readI];
  }
  return buffer.slice(0, writeI);
};

const getFrameHeaderLength = (majorVer: ID3v2MajorVersion): number => {
  switch (majorVer) {
    case 2:
      return 6;
    case 3:
    case 4:
      return 10;
  }
};

const readFrameFlags = (b: Uint8Array): IFrameFlags => {
  return {
    status: {
      tag_alter_preservation: getBit(b, 0, 6),
      file_alter_preservation: getBit(b, 0, 5),
      read_only: getBit(b, 0, 4),
    },
    format: {
      grouping_identity: getBit(b, 1, 7),
      compression: getBit(b, 1, 3),
      encryption: getBit(b, 1, 2),
      unsynchronisation: getBit(b, 1, 1),
      data_length_indicator: getBit(b, 1, 0),
    },
  };
};

const readFrameData = (
  uint8Array: Uint8Array,
  frameHeader: IFrameHeader,
  majorVer: ID3v2MajorVersion,
  includeCovers: boolean,
  warningCollector: IWarningCollector
) => {
  const frameParser = new FrameParser(majorVer, warningCollector);
  switch (majorVer) {
    case 2:
      return frameParser.readData(uint8Array, frameHeader.id, includeCovers);
    case 3:
    case 4:
      if (frameHeader.flags.format.unsynchronisation) {
        uint8Array = removeUnsyncBytes(uint8Array);
      }
      if (frameHeader.flags.format.data_length_indicator) {
        uint8Array = uint8Array.slice(4, uint8Array.length);
      }
      return frameParser.readData(uint8Array, frameHeader.id, includeCovers);
  }
};

/**
 * Create a combined tag key, of tag & description
 * @param tag e.g.: COM
 * @param description e.g. iTunPGAP
 * @returns string e.g. COM:iTunPGAP
 */
const makeDescriptionTagName = (tag: string, description: string): string => {
  return tag + (description ? ":" + description : "");
};
