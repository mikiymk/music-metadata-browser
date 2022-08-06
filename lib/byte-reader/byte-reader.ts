export type ByteReader = {
  read(length: number): Promise<Uint8Array>;
  peekSubReader(length: number): Promise<ByteReader>;
};
