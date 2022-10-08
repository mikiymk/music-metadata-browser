import { AttachedPictureType } from "../../id3v2/AttachedPictureType";
import { map } from "../combinate/map";
import { bytes, bytesTokenizer } from "../primitive/bytes";
import { u32be } from "../primitive/integer";
import { utf8 } from "../primitive/string";
import { readUnitFromBufferTokenizer } from "../utility/read-unit";

import type { IPicture } from "../../type";
import type { Unit } from "../type/unit";

/**
 * Interface to parsed result of METADATA_BLOCK_PICTURE
 * Ref: https://wiki.xiph.org/VorbisComment#METADATA_BLOCK_PICTURE
 * Ref: https://xiph.org/flac/format.html#metadata_block_picture
 * ToDo: move to ID3 / APIC?
 */
export interface FlacBlockPicture extends IPicture {
  /** The picture type according to the ID3v2 APIC frame */
  type: string;
  /** The description of the picture, in UTF-8. */
  description: string;
  /** The width of the picture in pixels. */
  width: number;
  /** The height of the picture in pixels. */
  height: number;
  /** The color depth of the picture in bits-per-pixel. */
  colourDepth: number;
  /** For indexed-color pictures (e.g. GIF), the number of colors used, or 0 for non-indexed pictures. */
  indexedColor: number;
}

/**
 *
 * @param length data length > 32 (bytes)
 * @returns
 */
export const flacBlockPicture = (length: number): Unit<FlacBlockPicture, RangeError> =>
  map(bytesTokenizer(length), (tokenizer) => {
    const type = AttachedPictureType[readUnitFromBufferTokenizer(tokenizer, u32be)];

    const mimeLen = readUnitFromBufferTokenizer(tokenizer, u32be);
    const format = readUnitFromBufferTokenizer(tokenizer, utf8(mimeLen));

    const descLen = readUnitFromBufferTokenizer(tokenizer, u32be);
    const description = readUnitFromBufferTokenizer(tokenizer, utf8(descLen));

    const width = readUnitFromBufferTokenizer(tokenizer, u32be);
    const height = readUnitFromBufferTokenizer(tokenizer, u32be);
    const colourDepth = readUnitFromBufferTokenizer(tokenizer, u32be);
    const indexedColor = readUnitFromBufferTokenizer(tokenizer, u32be);

    const dataLen = readUnitFromBufferTokenizer(tokenizer, u32be);
    const data = readUnitFromBufferTokenizer(tokenizer, bytes(dataLen));

    return {
      type,
      format,
      description,
      width,
      height,
      colourDepth,
      indexedColor,
      data,
    };
  });
