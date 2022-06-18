import { IGetToken } from "../strtok3";

import { IChunkHeader } from "../iff";

/**
 * Ref: https://msdn.microsoft.com/en-us/library/windows/desktop/dd317599(v=vs.85).aspx
 */
export enum WaveFormat {
  PCM = 0x00_01,
  // MPEG-4 and AAC Audio Types
  ADPCM = 0x00_02,
  IEEE_FLOAT = 0x00_03,
  MPEG_ADTS_AAC = 0x16_00,
  MPEG_LOAS = 0x16_02,
  RAW_AAC1 = 0x00_ff,
  // Dolby Audio Types
  DOLBY_AC3_SPDIF = 0x00_92,
  DVM = 0x20_00,
  RAW_SPORT = 0x02_40,
  ESST_AC3 = 0x02_41,
  DRM = 0x00_09,
  DTS2 = 0x20_01,
  MPEG = 0x00_50,
}

/**
 * "fmt"  sub-chunk describes the sound data's format
 * Ref: http://soundfile.sapp.org/doc/WaveFormat
 */
export interface IWaveFormat {
  /**
   * PCM = 1 (i.e. Linear quantization). Values other than 1 indicate some form of compression.
   */
  wFormatTag: WaveFormat;
  /**
   * Mono = 1, Stereo = 2, etc.
   */
  nChannels: number;
  /**
   * 8000, 44100, etc.
   */
  nSamplesPerSec: number;
  nAvgBytesPerSec: number;
  nBlockAlign: number;
  wBitsPerSample: number;
}

/**
 * format chunk; chunk-id is "fmt "
 * http://soundfile.sapp.org/doc/WaveFormat/
 */
export class Format implements IGetToken<IWaveFormat> {
  public len: number;

  public constructor(header: IChunkHeader) {
    if (header.chunkSize < 16) throw new Error("Invalid chunk size");
    this.len = header.chunkSize;
  }

  public get(buf: Buffer, off: number): IWaveFormat {
    return {
      wFormatTag: buf.readUInt16LE(off),
      nChannels: buf.readUInt16LE(off + 2),
      nSamplesPerSec: buf.readUInt32LE(off + 4),
      nAvgBytesPerSec: buf.readUInt32LE(off + 8),
      nBlockAlign: buf.readUInt16LE(off + 12),
      wBitsPerSample: buf.readUInt16LE(off + 14),
    };
  }
}
