import { IPageHeader } from "./Header";

export interface IPageConsumer {
  /**
   * Parse Ogg page
   * @param {IPageHeader} header Ogg page header
   * @param {Buffer} pageData Ogg page data
   */
  parsePage(header: IPageHeader, pageData: Uint8Array): void;

  /**
   * Calculate duration of provided header
   * @param header Ogg header
   */
  calculateDuration(header: IPageHeader): void;

  /**
   * Force to parse pending segments
   */
  flush(): void;
}
