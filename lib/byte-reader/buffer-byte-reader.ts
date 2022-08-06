import type { ByteReader } from "./byte-reader";

export class BufferByteReader implements ByteReader {
  private buffer: Uint8Array;
  private position = 0;

  constructor(buffer: Uint8Array | ArrayBufferLike) {
    this.buffer = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  }

  read(length: number): Promise<Uint8Array> {
    const buffer = this.buffer.subarray(this.position, this.position + length);
    this.position += length;
    return Promise.resolve(buffer);
  }

  peek(length: number): Promise<Uint8Array> {
    return Promise.resolve(this.buffer.subarray(this.position, this.position + length));
  }
}
