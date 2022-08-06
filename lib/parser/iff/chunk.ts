import type { ByteReader } from "../../byte-reader/byte-reader";
import { parseSeek } from "../base/ignore";
import { parseUnsignedInt32BigEndian } from "../base/unsigned-integer";
import { parseFourCC } from "../common/four-cc";

/**
 * "EA IFF 85" Standard for Interchange Format Files
 * Ref: http://www.martinreddy.net/gfx/2d/IFF.txt
 */
export type IffChunk = {
  /**
   * A chunk ID (ie, 4 ASCII bytes)
   */
  chunkID: string;
  /**
   * Number of data bytes following this data header
   */
  chunkSize: number;

  chunkData: ByteReader;
};

export const parseIffChunk = async (reader: ByteReader): Promise<IffChunk> => {
  const chunkID = await parseFourCC(reader);
  const chunkSize = await parseUnsignedInt32BigEndian(reader);

  const chunkData = await reader.peekSubReader(chunkSize);

  if (chunkSize / 2 === 1) await parseSeek(reader, 1);

  return {
    chunkID,
    chunkSize,
    chunkData,
  };
};
