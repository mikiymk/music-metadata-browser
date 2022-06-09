import { createReadStream, readFileSync } from "fs";

import { parseFile, parseStream, parseBuffer } from "../lib";

import type { IAudioMetadata, IOptions } from "../lib/type";

type ParseFileMethod = (
  filePath: string,
  mimeType?: string,
  options?: IOptions
) => Promise<IAudioMetadata>;

interface IParser {
  description: string;
  initParser: ParseFileMethod;
}

/**
 * Helps looping through different input styles
 */
export const Parsers: IParser[] = [
  {
    description: "parseFile",
    initParser: (filePath: string, mimeType?: string, options?: IOptions) => {
      return parseFile(filePath, options);
    },
  },
  {
    description: "parseStream",
    initParser: (filePath: string, mimeType?: string, options?: IOptions) => {
      const stream = createReadStream(filePath);
      return parseStream(stream, { mimeType }, options).then((metadata) => {
        stream.close();
        return metadata;
      });
    },
  },
  {
    description: "parseBuffer",
    initParser: (filePath: string, mimeType?: string, options?: IOptions) => {
      const buffer = readFileSync(filePath);
      const array = new Uint8Array(buffer);
      return parseBuffer(array, { mimeType }, options);
    },
  },
];
