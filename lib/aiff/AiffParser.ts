import { BasicParser } from "../common/BasicParser";
import initDebug from "../debug";
import { ID3v2Parser } from "../id3v2/ID3v2Parser";
import { Header } from "../iff";
import { readBuffer } from "../parser/base/buffer";
import { readCommonToken } from "../parser/part/aiff/common";
import { FOUR_CC_TOKEN_SIZE, readFourCcToken } from "../parser/part/fourcc/fourcc";
import { IffChunkHeader, IFF_CHUNK_HEADER_SIZE, readIffChunkHeader } from "../parser/part/iff/chunk-header";
import { readSizedToken, readToken } from "../parser/token";
import { EndOfStreamError } from "../strtok3";
import { fromBuffer } from "../strtok3/fromBuffer";

const debug = initDebug("music-metadata:parser:aiff");

/**
 * AIFF - Audio Interchange File Format
 *
 * Ref:
 * - http://www-mmsp.ece.mcgill.ca/Documents/AudioFormats/AIFF/AIFF.html
 * - http://www-mmsp.ece.mcgill.ca/Documents/AudioFormats/AIFF/Docs/AIFF-1.3.pdf
 */
export class AIFFParser extends BasicParser {
  private isCompressed: boolean;

  public async parse(): Promise<void> {
    const header = await readToken(this.tokenizer, IFF_CHUNK_HEADER_SIZE, readIffChunkHeader);

    if (header.id !== "FORM") throw new Error("Invalid Chunk-ID, expected 'FORM'"); // Not AIFF format

    const type = await readToken(this.tokenizer, FOUR_CC_TOKEN_SIZE, readFourCcToken);
    switch (type) {
      case "AIFF":
        this.metadata.setFormat("container", type);
        this.isCompressed = false;
        break;

      case "AIFC":
        this.metadata.setFormat("container", "AIFF-C");
        this.isCompressed = true;
        break;

      default:
        throw new Error("Unsupported AIFF type: " + type);
    }
    this.metadata.setFormat("lossless", !this.isCompressed);

    try {
      while (
        this.tokenizer.fileInfo.size === 0 ||
        this.tokenizer.fileInfo.size - this.tokenizer.position >= Header.len
      ) {
        debug(`Reading AIFF chunk at offset=${this.tokenizer.position}`);
        const chunkHeader = await readToken(this.tokenizer, IFF_CHUNK_HEADER_SIZE, readIffChunkHeader);

        debug(`Chunk id=${chunkHeader.id}`);
        const nextChunk = 2 * Math.round(chunkHeader.size / 2);
        const bytesRead = await this.readData(chunkHeader);
        await this.tokenizer.ignore(nextChunk - bytesRead);
      }
    } catch (error) {
      if (error instanceof EndOfStreamError) {
        debug(`End-of-stream`);
      } else {
        throw error;
      }
    }
  }

  public async readData(header: IffChunkHeader): Promise<number> {
    switch (header.id) {
      case "COMM": {
        // The Common Chunk
        const common = await readSizedToken(this.tokenizer, header.size, readCommonToken, this.isCompressed);
        this.metadata.setFormat("bitsPerSample", common.sampleSize);
        this.metadata.setFormat("sampleRate", common.sampleRate);
        this.metadata.setFormat("numberOfChannels", common.numChannels);
        this.metadata.setFormat("numberOfSamples", common.numSampleFrames);
        this.metadata.setFormat("duration", common.numSampleFrames / common.sampleRate);
        this.metadata.setFormat("codec", common.compressionName);
        return header.size;
      }
      case "ID3 ": {
        // ID3-meta-data
        const id3_data = await readSizedToken(this.tokenizer, header.size, readBuffer);

        const rst = fromBuffer(id3_data);
        await new ID3v2Parser().parse(this.metadata, rst, this.options);
        return header.size;
      }
      case "SSND": // Sound Data Chunk
        if (this.metadata.format.duration) {
          this.metadata.setFormat("bitrate", (8 * header.size) / this.metadata.format.duration);
        }
        return 0;

      default:
        return 0;
    }
  }
}
