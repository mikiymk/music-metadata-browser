import type * as Stream from "node:stream";
import * as strtok3 from "./strtok3";

import * as parseFromTokenizer from "./parseFromTokenizer";
import type { IAudioMetadata, IOptions } from "./type";

/**
 * Parse audio from Node Stream.Readable
 * @param stream - Stream to read the audio track from
 * @param fileInfo - File information object or MIME-type, e.g.: 'audio/mpeg'
 * @param options - Parsing options
 * @returns Metadata
 */
export async function parseStream(
  stream: Stream.Readable,
  fileInfo?: strtok3.IFileInfo | string,
  options: IOptions = {}
): Promise<IAudioMetadata> {
  const tokenizer = await strtok3.fromStream(stream, typeof fileInfo === "string" ? { mimeType: fileInfo } : fileInfo);
  return parseFromTokenizer.parseFromTokenizer(tokenizer, options);
}
