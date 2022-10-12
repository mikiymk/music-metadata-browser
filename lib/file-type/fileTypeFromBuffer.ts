import { fromBuffer } from "../strtok3/fromBuffer";

import { detectFileTypeFromTokenizer } from "./fileTypeFromTokenizer";

import type { FileTypeResult } from "./type";

/**
 * Detect the file type of a `Buffer`, `Uint8Array`, or `ArrayBuffer`.
 *
 * The file type is detected by checking the [magic number](https://en.wikipedia.org/wiki/Magic_number_(programming)#Magic_numbers_in_files) of the buffer.
 *
 * If file access is available, it is recommended to use `.fromFile()` instead.
 * @param buffer - An Uint8Array or Buffer representing file data. It works best if the buffer contains the entire file, it may work with a smaller portion as well.
 * @returns The detected file type and MIME type, or `undefined` when there is no match.
 */
export const detectFileType = (buffer: Uint8Array): Promise<FileTypeResult> | undefined => {
  if (buffer.length > 1) {
    return detectFileTypeFromTokenizer(fromBuffer(buffer));
  }
};
