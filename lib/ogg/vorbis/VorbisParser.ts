import initDebug from "../../debug";
import { UINT32_LE } from "../../token-types";

import { CommonHeader } from "./VorbisCommonHeader";
import { VorbisDecoder } from "./VorbisDecoder";
import { IdentificationHeader } from "./VorbisIdentificationHeader";
import { IVorbisPicture, VorbisPictureToken } from "./VorbisPicture";

import type { INativeMetadataCollector } from "../../common/INativeMetadataCollector";
import type { IOptions } from "../../type";
import type { IPageHeader } from "../Header";
import type { IPageConsumer } from "../PageConsumer";

const debug = initDebug("music-metadata:parser:ogg:vorbis1");

/**
 * Vorbis 1 Parser.
 * Used by OggParser
 */
export class VorbisParser implements IPageConsumer {
  private pageSegments: Uint8Array[] = [];

  constructor(protected metadata: INativeMetadataCollector, protected options: IOptions) {}

  /**
   * Vorbis 1 parser
   * @param header Ogg Page Header
   * @param pageData Page data
   */
  public parsePage(header: IPageHeader, pageData: Uint8Array) {
    if (header.headerType.firstPage) {
      this.parseFirstPage(header, pageData);
    } else {
      if (header.headerType.continued) {
        if (this.pageSegments.length === 0) {
          throw new Error('Cannot continue on previous page');
        }
        this.pageSegments.push(pageData);
      }
      if (header.headerType.lastPage || !header.headerType.continued) {
        // Flush page segments
        if (this.pageSegments.length > 0) {
          this.flush();
        }
        // Reset page segments
        this.pageSegments = header.headerType.lastPage ? [] : [pageData];
      }
    }
    if (header.headerType.lastPage) {
      this.calculateDuration(header);
    }
  }

  public flush() {
    const fullPageSize = this.pageSegments.reduce((p, c) => p + c.byteLength, 0);
    const fullPage = new Uint8Array(fullPageSize);

    let pos = 0;
    for (const pageSegment of this.pageSegments) {
      fullPage.set(pageSegment, pos);
      pos += pageSegment.byteLength;
    }

    this.parseFullPage(fullPage);
  }

  public parseUserComment(pageData: Uint8Array, offset: number): number {
    const decoder = new VorbisDecoder(pageData, offset);
    const tag = decoder.parseUserComment();

    this.addTag(tag.key, tag.value);

    return tag.len;
  }

  public addTag(id: string, value: string | IVorbisPicture) {
    if (id === "METADATA_BLOCK_PICTURE" && typeof value === "string") {
      if (this.options.skipCovers) {
        debug(`Ignore picture`);
        return;
      }
      value = VorbisPictureToken.fromBase64(value);
      debug(`Push picture: id=${id}, format=${value.format}`);
    } else {
      debug(`Push tag: id=${id}, value=${String(value)}`);
    }

    this.metadata.addTag("vorbis", id, value);
  }

  public calculateDuration(header: IPageHeader) {
    if (this.metadata.format.sampleRate && header.absoluteGranulePosition >= 0) {
      // Calculate duration
      this.metadata.setFormat("numberOfSamples", header.absoluteGranulePosition);
      this.metadata.setFormat("duration", this.metadata.format.numberOfSamples / this.metadata.format.sampleRate);
    }
  }

  /**
   * Parse first Ogg/Vorbis page
   * @param header
   * @param pageData
   */
  protected parseFirstPage(header: IPageHeader, pageData: Uint8Array) {
    this.metadata.setFormat("codec", "Vorbis I");
    debug("Parse first page");
    // Parse  Vorbis common header
    const commonHeader = CommonHeader.get(pageData, 0);
    if (commonHeader.vorbis !== "vorbis") throw new Error("Metadata does not look like Vorbis");
    if (commonHeader.packetType === 1) {
      const idHeader = IdentificationHeader.get(pageData, CommonHeader.len);

      this.metadata.setFormat("sampleRate", idHeader.sampleRate);
      this.metadata.setFormat("bitrate", idHeader.bitrateNominal);
      this.metadata.setFormat("numberOfChannels", idHeader.channelMode);
      debug(
        "sample-rate=%s[hz], bitrate=%s[b/s], channel-mode=%s",
        idHeader.sampleRate,
        idHeader.bitrateNominal,
        idHeader.channelMode
      );
    } else throw new Error("First Ogg page should be type 1: the identification header");
  }

  protected parseFullPage(pageData: Uint8Array) {
    // New page
    const commonHeader = CommonHeader.get(pageData, 0);
    debug('Parse full page: type=%s, byteLength=%s', commonHeader.packetType, pageData.byteLength);
    switch (commonHeader.packetType) {
      case 3: //  type 3: comment header
        return this.parseUserCommentList(pageData, CommonHeader.len);

      case 1: // type 1: the identification header
      case 5: // type 5: setup header type
        break; // ignore
    }
  }

  /**
   * Ref: https://xiph.org/vorbis/doc/Vorbis_I_spec.html#x1-840005.2
   * @param pageData
   * @param offset
   */
  protected parseUserCommentList(pageData: Uint8Array, offset: number) {
    const strLen = UINT32_LE.get(pageData, offset);
    offset += 4;
    // const vendorString = new Token.StringType(strLen, 'utf-8').get(pageData, offset);
    offset += strLen;
    let userCommentListLength = UINT32_LE.get(pageData, offset);
    offset += 4;

    while (userCommentListLength-- > 0) {
      offset += this.parseUserComment(pageData, offset);
    }
  }
}
