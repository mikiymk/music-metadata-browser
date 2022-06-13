import { ITokenizer } from "../../strtok3";
import initDebug from "debug";

import { IOptions } from "../../type";
import { INativeMetadataCollector } from "../../common/INativeMetadataCollector";

import { IPageHeader } from "../Header";
import { IPageConsumer } from "../PageConsumer";

import { IdentificationHeader } from "./TheoraIdHeader";

const debug = initDebug("music-metadata:parser:ogg:theora");

/**
 * Ref:
 * - https://theora.org/doc/Theora.pdf
 */
export class TheoraParser implements IPageConsumer {
  constructor(
    private metadata: INativeMetadataCollector,
    options: IOptions,
    private tokenizer: ITokenizer
  ) {}

  /**
   * Vorbis 1 parser
   * @param header Ogg Page Header
   * @param pageData Page data
   */
  public parsePage(header: IPageHeader, pageData: Buffer) {
    if (header.headerType.firstPage) {
      this.parseFirstPage(header, pageData);
    }
  }

  public flush() {
    debug("flush");
  }

  public calculateDuration(header: IPageHeader) {
    debug("duration calculation not implemented");
  }

  /**
   * Parse first Theora Ogg page. the initial identification header packet
   * @param {IPageHeader} header
   * @param {Buffer} pageData
   */
  protected parseFirstPage(header: IPageHeader, pageData: Buffer) {
    debug("First Ogg/Theora page");
    this.metadata.setFormat("codec", "Theora");
    const idHeader = IdentificationHeader.get(pageData, 0);
    this.metadata.setFormat("bitrate", idHeader.nombr);
  }
}
