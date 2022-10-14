import type { IGetToken } from "../token-types";

export type Awaitable<T> = T | Promise<T>;

export interface IFileInfo {
  /**
   * File size in bytes
   */
  size?: number | undefined;
  /**
   * MIME-type of file
   */
  mimeType?: string | undefined;

  /**
   * File path
   */
  path?: string | undefined;

  /**
   * File URL
   */
  url?: string | undefined;
}

export interface IReadChunkOptions {
  /**
   * The offset in the buffer to start writing at; default is 0
   */
  offset?: number | undefined;

  /**
   * Number of bytes to read.
   */
  length?: number | undefined;

  /**
   * Position where to begin reading from the file.
   * Default it is `tokenizer.position`.
   * Position may not be less then `tokenizer.position`.
   */
  position?: number | undefined;

  /**
   * If set, will not throw an EOF error if not all of the requested data could be read
   */
  mayBeLess?: boolean | undefined;
}

/**
 * The tokenizer allows us to read or peek from the tokenizer-stream.
 * The tokenizer-stream is an abstraction of a stream, file or Buffer.
 */
export interface ITokenizer {
  /**
   * Provide access to information of the underlying information stream or file.
   */
  fileInfo: IFileInfo;

  /**
   * Offset in bytes (= number of bytes read) since beginning of file or stream
   */
  position: number;

  /**
   * Peek (read ahead) buffer from tokenizer
   * @param buffer - Target buffer to fill with data peek from the tokenizer-stream
   * @param options - Read behaviour options
   * @returns Promise with number of bytes read
   */
  peekBuffer(buffer: Uint8Array, options?: IReadChunkOptions): Awaitable<number>;

  /**
   * Peek (read ahead) buffer from tokenizer
   * @param buffer - Target buffer to fill with data peeked from the tokenizer-stream
   * @param options - Additional read options
   * @returns Promise with number of bytes read
   */
  readBuffer(buffer: Uint8Array, options?: IReadChunkOptions): Awaitable<number>;

  /**
   * Peek a token from the tokenizer-stream.
   * @param token - Token to peek from the tokenizer-stream.
   * @param position - Offset where to begin reading within the file. If position is null, data will be read from the current file position.
   * @param maybeless - If set, will not throw an EOF error if the less then the requested length could be read.
   */
  peekToken<T>(token: IGetToken<T>, position?: number | null, maybeless?: boolean): Awaitable<T>;

  /**
   * Read a token from the tokenizer-stream.
   * @param token - Token to peek from the tokenizer-stream.
   * @param position - Offset where to begin reading within the file. If position is null, data will be read from the current file position.
   */
  readToken<T>(token: IGetToken<T>, position?: number): Awaitable<T>;

  /**
   * Peek a numeric token from the stream
   * @param token - Numeric token
   * @returns Promise with number
   */
  peekNumber(token: IGetToken<number>): Awaitable<number>;

  /**
   * Read a numeric token from the stream
   * @param token - Numeric token
   * @returns Promise with number
   */
  readNumber(token: IGetToken<number>): Awaitable<number>;

  /**
   * Ignore given number of bytes
   * @param length - Number of bytes ignored
   */
  ignore(length: number): Awaitable<number>;

  /**
   * Clean up resources.
   * It does not close the stream for StreamReader, but is does close the file-descriptor.
   */
  close(): Awaitable<void>;
}
