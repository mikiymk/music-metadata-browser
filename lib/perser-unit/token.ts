import { EndOfStreamError, ITokenizer } from "../strtok3";

export type TokenReader<TokenType> = [size: number, reader: (buffer: Uint8Array, offset: number) => TokenType];

export const seq = <TokenReaders extends readonly [] | readonly TokenReader<unknown>[]>(
  ...readers: TokenReaders
): TokenReader<{
  readonly [key in keyof TokenReaders]: TokenReaders[key] extends TokenReader<infer Type> ? Type : never;
}> => {
  let sum = 0;
  for (const [size] of readers) {
    sum += size;
  }
  return [
    sum,
    (buffer, offset) => {
      const values = [];
      for (const [size, reader] of readers) {
        values.push(reader(buffer, offset));
        offset += size;
      }

      return values as {
        [key in keyof TokenReaders]: TokenReaders[key] extends TokenReader<infer Type> ? Type : never;
      };
    },
  ];
};

export const map = <T, U>([size, reader]: TokenReader<T>, fn: (value: T) => U): TokenReader<U> => [
  size,
  (buffer, offset) => fn(reader(buffer, offset)),
];

export const seqMap = <TokenReaders extends TokenReader<unknown>[], U>(
  fn: (
    ...value: { [key in keyof TokenReaders]: TokenReaders[key] extends TokenReader<infer Type> ? Type : never }
  ) => U,
  ...readers: TokenReaders
): TokenReader<U> => map(seq(...readers), (values) => fn(...values));

export const readToken = async <T>(tokenizer: ITokenizer, [size, reader]: TokenReader<T>): Promise<T> => {
  // tokenizer read token
  const uint8Array = new Uint8Array(size);
  const len = await tokenizer.readBuffer(uint8Array);
  if (len < size) throw new EndOfStreamError();
  return reader(uint8Array, 0);
};

export const peekToken = async <T>(tokenizer: ITokenizer, [size, reader]: TokenReader<T>): Promise<T> => {
  // tokenizer read token
  const uint8Array = new Uint8Array(size);
  const len = await tokenizer.peekBuffer(uint8Array);
  if (len < size) throw new EndOfStreamError();
  return reader(uint8Array, 0);
};
