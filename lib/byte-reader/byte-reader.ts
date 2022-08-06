export type ByteReader = {
  read(length: number): Promise<Uint8Array>;
  peek(length: number): Promise<Uint8Array>;
};
