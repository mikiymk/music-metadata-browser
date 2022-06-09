import initDebug from "debug";
import { type IFileInfo, fromStream, fromFile } from "strtok3";

import { ParserFactory } from "./ParserFactory";
import { RandomFileReader } from "./common/RandomFileReader";
import { parseFromTokenizer, scanAppendingHeaders } from "./core";

import type { IAudioMetadata, IOptions } from "./type";
import type { Readable } from "stream";

const debug = initDebug("music-metadata:parser");

/**
 * Parse audio from Node Stream.Readable
 * @param stream - Stream to read the audio track from
 * @param fileInfo - File information object or MIME-type, e.g.: 'audio/mpeg'
 * @param options - Parsing options
 * @returns Metadata
 */
export async function parseStream(
  stream: Readable,
  fileInfo?: IFileInfo | string,
  options: IOptions = {}
): Promise<IAudioMetadata> {
  const tokenizer = await fromStream(
    stream,
    typeof fileInfo === "string" ? { mimeType: fileInfo } : fileInfo
  );
  return parseFromTokenizer(tokenizer, options);
}

/**
 * Parse audio from Node file
 * @param filePath - Media file to read meta-data from
 * @param options - Parsing options
 * @returns Metadata
 */
export async function parseFile(
  filePath: string,
  options: IOptions = {}
): Promise<IAudioMetadata> {
  debug(`parseFile: ${filePath}`);

  const fileTokenizer = await fromFile(filePath);

  const fileReader = await RandomFileReader.init(
    filePath,
    fileTokenizer.fileInfo.size
  );
  try {
    await scanAppendingHeaders(fileReader, options);
  } finally {
    await fileReader.close();
  }

  try {
    const parserName = ParserFactory.getParserIdForExtension(filePath);
    if (!parserName) debug(" Parser could not be determined by file extension");

    return await ParserFactory.parse(fileTokenizer, parserName, options);
  } finally {
    await fileTokenizer.close();
  }
}
