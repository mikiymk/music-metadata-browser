import { BasicParser } from "../common/BasicParser";
import { findZero } from "../common/Util";
import { decodeUtf8 } from "../compat/text-decoder";
import initDebug from "../debug";
import { readLatin1String, readUtf8String } from "../parser/base/string";
import { Apev2Descriptor, APEV2_DESCRIPTOR_SIZE, readApev2Descriptor } from "../parser/part/apev2/descriptor";
import { APEV2_FOOTER_SIZE, Apev2Footer, readApev2Footer } from "../parser/part/apev2/footer";
import { Apev2Header, APEV2_HEADER_SIZE, readApev2Header } from "../parser/part/apev2/header";
import { APEV2_TAG_ITEM_HEADER_SIZE, readApev2TagItemHeader } from "../parser/part/apev2/tag-item-header";
import { peekToken, readSizedToken, readToken } from "../parser/token";
import { fromBuffer } from "../strtok3/fromBuffer";

import type { INativeMetadataCollector } from "../common/INativeMetadataCollector";
import type { ITokenizer } from "../strtok3";
import type { IOptions, IRandomReader, IApeHeader } from "../type";

const debug = initDebug("music-metadata:parser:APEv2");

/**
 * APETag versionIndex history / supported formats
 *
 * 1.0 (1000) - Original APE tag spec.  Fully supported by this code.
 * 2.0 (2000) - Refined APE tag spec (better streaming support, UTF StringEncoding). Fully supported by this code.
 *
 * Notes:
 * - also supports reading of ID3v1.1 tags
 * - all saving done in the APE Tag format using CURRENT_APE_TAG_VERSION
 *
 * APE File Format Overview: (pieces in order -- only valid for the latest versionIndex APE files)
 *
 * JUNK - any amount of "junk" before the APE_DESCRIPTOR (so people that put ID3v2 tags on the files aren't hosed)
 * APE_DESCRIPTOR - defines the sizes (and offsets) of all the pieces, as well as the MD5 checksum
 * APE_HEADER - describes all of the necessary information about the APE file
 * SEEK TABLE - the table that represents seek offsets [optional]
 * HEADER DATA - the pre-audio data from the original file [optional]
 * APE FRAMES - the actual compressed audio (broken into frames for seekability)
 * TERMINATING DATA - the post-audio data from the original file [optional]
 * TAG - describes all the properties of the file [optional]
 */

const tagFormat = "APEv2";

interface IApeInfo {
  descriptor?: Apev2Descriptor;
  header?: Apev2Header;
  footer?: Apev2Footer;
}

const preamble = "APETAGEX";

export class APEv2Parser extends BasicParser {
  private ape: IApeInfo = {};

  /**
   * Parse APEv1 / APEv2 header if header signature found
   */
  public async tryParseApeHeader(): Promise<void> {
    if (
      this.tokenizer.fileInfo.size > 0 &&
      this.tokenizer.fileInfo.size - this.tokenizer.position < APEV2_FOOTER_SIZE
    ) {
      debug(`No APEv2 header found, end-of-file reached`);
      return;
    }

    const footer = await peekToken(this.tokenizer, APEV2_FOOTER_SIZE, readApev2Footer);
    if (footer.id === preamble) {
      await this.tokenizer.ignore(APEV2_FOOTER_SIZE);
      return this.parseTags(footer);
    } else {
      debug(`APEv2 header not found at offset=${this.tokenizer.position}`);
      if (this.tokenizer.fileInfo.size > 0) {
        // Try to read the APEv2 header using just the footer-header
        const remaining = this.tokenizer.fileInfo.size - this.tokenizer.position; // ToDo: take ID3v1 into account
        const buffer = new Uint8Array(remaining);
        await this.tokenizer.readBuffer(buffer);
        return parseTagFooter(this.metadata, buffer, this.options);
      }
    }
  }

  public async parse(): Promise<void> {
    const descriptor = await readToken(this.tokenizer, APEV2_DESCRIPTOR_SIZE, readApev2Descriptor);

    if (descriptor.id !== "MAC ") throw new Error("Unexpected descriptor ID");
    this.ape.descriptor = descriptor;
    const lenExp = descriptor.descriptorBytes - APEV2_DESCRIPTOR_SIZE;
    const header = await (lenExp > 0 ? this.parseDescriptorExpansion(lenExp) : this.parseHeader());

    await this.tokenizer.ignore(header.forwardBytes);
    return this.tryParseApeHeader();
  }

  public async parseTags(footer: Apev2Footer): Promise<void> {
    const keyBuffer = new Uint8Array(256); // maximum tag key length

    let bytesRemaining = footer.size - APEV2_FOOTER_SIZE;

    debug(`Parse APE tags at offset=${this.tokenizer.position}, size=${bytesRemaining}`);

    for (let i = 0; i < footer.fields; i++) {
      if (bytesRemaining < APEV2_TAG_ITEM_HEADER_SIZE) {
        this.metadata.addWarning(
          `APEv2 Tag-header: ${footer.fields - i} items remaining, but no more tag data to read.`
        );
        break;
      }

      // Only APEv2 tag has tag item headers
      const tagItemHeader = await readToken(this.tokenizer, APEV2_TAG_ITEM_HEADER_SIZE, readApev2TagItemHeader);
      bytesRemaining -= APEV2_TAG_ITEM_HEADER_SIZE + tagItemHeader.size;

      await this.tokenizer.peekBuffer(keyBuffer, {
        length: Math.min(keyBuffer.length, bytesRemaining),
      });
      let zero = findZero(keyBuffer, 0, keyBuffer.length);
      const key = await readSizedToken(this.tokenizer, zero, readLatin1String);
      await this.tokenizer.ignore(1);
      bytesRemaining -= key.length + 1;

      switch (tagItemHeader.flags.dataType) {
        case 0: {
          // utf-8 text-string
          const value = await readSizedToken(this.tokenizer, tagItemHeader.size, readUtf8String);
          const values = value.split(/\0/g);

          for (const val of values) {
            this.metadata.addTag(tagFormat, key, val);
          }
          break;
        }

        case 1: // binary (probably artwork)
          if (this.options.skipCovers) {
            await this.tokenizer.ignore(tagItemHeader.size);
          } else {
            const picData = new Uint8Array(tagItemHeader.size);
            await this.tokenizer.readBuffer(picData);

            zero = findZero(picData, 0, picData.length);
            const description = decodeUtf8(picData.subarray(0, zero));

            const data = new Uint8Array(picData.subarray(zero + 1));
            this.metadata.addTag(tagFormat, key, {
              description,
              data,
            });
          }
          break;

        case 2:
          debug(`Ignore external info ${key}`);
          await this.tokenizer.ignore(tagItemHeader.size);
          break;

        case 3:
          debug(`Ignore external info ${key}`);
          this.metadata.addWarning(`APEv2 header declares a reserved datatype for "${key}"`);
          await this.tokenizer.ignore(tagItemHeader.size);
          break;
      }
    }
  }

  private async parseDescriptorExpansion(lenExp: number): Promise<{ forwardBytes: number }> {
    await this.tokenizer.ignore(lenExp);
    return this.parseHeader();
  }

  private async parseHeader(): Promise<{ forwardBytes: number }> {
    const header = await readToken(this.tokenizer, APEV2_HEADER_SIZE, readApev2Header);

    // ToDo before
    this.metadata.setFormat("lossless", true);
    this.metadata.setFormat("container", "Monkey's Audio");

    this.metadata.setFormat("bitsPerSample", header.bitsPerSample);
    this.metadata.setFormat("sampleRate", header.sampleRate);
    this.metadata.setFormat("numberOfChannels", header.channel);
    this.metadata.setFormat("duration", calculateDuration(header));

    return {
      forwardBytes:
        this.ape.descriptor.seekTableBytes +
        this.ape.descriptor.headerDataBytes +
        this.ape.descriptor.apeFrameDataBytes +
        this.ape.descriptor.terminatingDataBytes,
    };
  }
}

export const tryParseApeHeader = (
  metadata: INativeMetadataCollector,
  tokenizer: ITokenizer,
  options: IOptions
): Promise<void> => {
  const apeParser = new APEv2Parser();
  apeParser.init(metadata, tokenizer, options);
  return apeParser.tryParseApeHeader();
};

/**
 * Calculate the media file duration
 * @param ah ApeHeader
 * @returns {number} duration in seconds
 */
export const calculateDuration = (ah: Apev2Header): number => {
  let duration = ah.totalFrames > 1 ? ah.blocksPerFrame * (ah.totalFrames - 1) : 0;
  duration += ah.finalFrameBlocks;
  return duration / ah.sampleRate;
};

/**
 * Calculates the APEv1 / APEv2 first field offset
 * @param reader
 * @param offset
 */
export const findApeFooterOffset = async (reader: IRandomReader, offset: number): Promise<IApeHeader> => {
  // Search for APE footer header at the end of the file
  const apeBuf = new Uint8Array(APEV2_FOOTER_SIZE);
  await reader.randomRead(apeBuf, 0, APEV2_FOOTER_SIZE, offset - APEV2_FOOTER_SIZE);
  const tagFooter = readApev2Footer(apeBuf, 0);
  if (tagFooter.id === "APETAGEX") {
    debug(`APE footer header at offset=${offset}`);
    return { footer: tagFooter, offset: offset - tagFooter.size };
  }
};

const parseTagFooter = (metadata: INativeMetadataCollector, buffer: Uint8Array, options: IOptions): Promise<void> => {
  const footer = readApev2Footer(buffer, buffer.length - APEV2_FOOTER_SIZE);
  if (footer.id !== preamble) throw new Error("Unexpected APEv2 Footer ID preamble value.");
  fromBuffer(buffer);
  const apeParser = new APEv2Parser();
  apeParser.init(metadata, fromBuffer(buffer), options);
  return apeParser.parseTags(footer);
};
