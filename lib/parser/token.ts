import { EndOfStreamError, ITokenizer } from "../strtok3";

export const readToken = async <
  TokenReader extends (buffer: Uint8Array, offset: number, ...restArgs: RestArgs) => unknown,
  RestArgs extends unknown[]
>(
  tokenizer: ITokenizer,
  offset: number,
  tokenSize: number,
  tokenReader: TokenReader,
  ...args: RestArgs
): Promise<ReturnType<TokenReader>> => {
  // tokenizer read token
  const uint8Array = new Uint8Array(tokenSize);
  const len = await tokenizer.readBuffer(uint8Array, { position: offset });
  if (len < tokenSize) throw new EndOfStreamError();
  return tokenReader(uint8Array, 0, ...args) as ReturnType<TokenReader>;
};

export const peekToken = async <
  TokenReader extends (buffer: Uint8Array, offset: number, ...restArgs: RestArgs) => unknown,
  RestArgs extends unknown[]
>(
  tokenizer: ITokenizer,
  offset: number,
  tokenSize: number,
  tokenReader: TokenReader,
  ...args: RestArgs
): Promise<ReturnType<TokenReader>> => {
  // tokenizer read token
  const uint8Array = new Uint8Array(tokenSize);
  const len = await tokenizer.peekBuffer(uint8Array, { position: offset });
  if (len < tokenSize) throw new EndOfStreamError();
  return tokenReader(uint8Array, 0, ...args) as ReturnType<TokenReader>;
};
