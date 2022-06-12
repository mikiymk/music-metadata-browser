/// <reference types="node" />
import { IGetToken } from "../strtok3";
export declare function stringToBytes(str: string): number[];
/**
 * Checks whether the TAR checksum is valid.
 * @param buffer - The TAR header `[offset ... offset + 512]`.
 * @param offset - TAR header offset.
 * @returns `true` if the TAR checksum is valid, otherwise `false`.
 */
export declare function tarHeaderChecksumMatches(buffer: Buffer, offset?: number): boolean;
/**
 * ID3 UINT32 sync-safe tokenizer token.
 * 28 bits (representing up to 256MB) integer, the msb is 0 to avoid "false syncsignals".
 */
export declare const uint32SyncSafeToken: IGetToken<number>;
