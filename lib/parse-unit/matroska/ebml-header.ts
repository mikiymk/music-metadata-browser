import { bytes } from "../primitive/bytes";
import { peekUnitFromTokenizer, readUnitFromBuffer, readUnitFromTokenizer } from "../utility/read-unit";

import { matroskaUint } from "./uint";
import { vintLength } from "./vint-length";

import type { ITokenizer } from "../../strtok3/types";

const EBML_ID_MAX_LENGTH = 4;
const EBML_SIZE_MAX_LENGTH = 8;

export interface EBMLHeader {
  id: number;
  length: number;
}

export const ebmlHeader = async (tokenizer: ITokenizer): Promise<EBMLHeader> => {
  const idLen = await peekUnitFromTokenizer(tokenizer, vintLength(EBML_ID_MAX_LENGTH));
  const id = await readUnitFromTokenizer(tokenizer, matroskaUint(idLen));

  const sizeLen = await peekUnitFromTokenizer(tokenizer, vintLength(EBML_SIZE_MAX_LENGTH));
  const lengthData = await readUnitFromTokenizer(tokenizer, bytes(sizeLen));
  lengthData[0] ^= 0x80 >> (sizeLen - 1); // remove VINT_MARKER
  const nrLen = Math.min(6, sizeLen); // JavaScript can max read 6 bytes integer
  const length = readUnitFromBuffer(matroskaUint(nrLen), lengthData, sizeLen - nrLen);

  return {
    id,
    length,
  };
};
