import type { ByteReader } from "../../byte-reader/byte-reader";
import { EndOfStreamError } from "../../peek-readable";
import { parseFourCC } from "../common/four-cc";
import { parseIffChunk, type IffChunk } from "../iff/chunk";
import { parseAiffCCommonChunk, parseAiffCommonChunk } from "./common";

type Format = {
  container: "AIFF" | "AIFF-C";
  lossless: boolean;

  bitsPerSample?: number;
  sampleRate?: number;
  numberOfChannels?: number;
  numberOfSamples?: number;
  duration?: number;
  bitrate?: number;
  codec?: string;
};

const parseAiff = async (reader: ByteReader): Promise<Aiff> => {
  const header = await parseIffChunk(reader);
  if (header.chunkID !== "FORM") {
    // Not AIFF format
    throw new Error("Invalid Chunk-ID, expected 'FORM'");
  }

  const type = await parseFourCC(reader);
  let isCompressed = false;
  let container: "AIFF" | "AIFF-C" = "AIFF";
  switch (type) {
    case "AIFF":
      break;

    case "AIFC":
      container = "AIFF-C";
      isCompressed = true;
      break;

    default:
      throw new Error("Unsupported AIFF type: " + type);
  }

  const format: Format = {
    container,
    lossless: !isCompressed,
  };
  let id3v2 = {};

  try {
    while (true) {
      const chunkHeader = await parseIffChunk(reader);

      const data = await readData(chunkHeader, isCompressed, format);
      id3v2 = { ...id3v2, ...data };
    }
  } catch (error) {
    if (error instanceof EndOfStreamError) {
      return {id3: id3v2, format};
    } else {
      throw error;
    }
  }
};

const readData = async (chunk: IffChunk, isCompressed: boolean, format: Format): Promise<ID3v2> => {
  switch (chunk.chunkID) {
    case "COMM": {
      // The Common Chunk
      const common = await (isCompressed ? parseAiffCommonChunk : parseAiffCCommonChunk)(chunk);

      format.bitsPerSample = common.sampleSize;
      format.sampleRate = common.sampleRate;
      format.numberOfChannels = common.numChannels;
      format.numberOfSamples = common.numSampleFrames;
      format.duration = common.numSampleFrames / common.sampleRate;
      format.codec = common.compressionName;

      return;
    }
    case "ID3 ": {
      // ID3-meta-data
      return parseID3v2(chunk.chunkData);
    }

    case "SSND": {
      // Sound Data Chunk
      if (format.duration) {
        format.bitrate = (8 * chunk.chunkSize) / format.duration;
      }
      return;
    }

    default:
      return;
  }
};
