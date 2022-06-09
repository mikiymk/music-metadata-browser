import { parseFromTokenizer, parseBuffer, selectCover } from "./core";
import { parseStream, parseFile } from "./coreNode";

export {
  IAudioMetadata,
  IOptions,
  ITag,
  INativeTagDict,
  ICommonTagsResult,
  IFormat,
  IPicture,
  IRatio,
  IChapter,
} from "./type";

export {
  parseFromTokenizer,
  parseBuffer,
  IFileInfo,
  selectCover,
  orderTags,
  ratingToStars,
} from "./core";

export { parseStream, parseFile } from "./coreNode";

/**
 * Define default module exports
 */
export default {
  parseStream,
  parseFile,
  parseFromTokenizer,
  parseBuffer,
  selectCover,
};
