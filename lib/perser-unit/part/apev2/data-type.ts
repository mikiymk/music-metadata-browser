export type DataType =
  | 0 // text_utf8
  | 1 // binary
  | 2 // external_info
  | 3; // reserved
export const DataTypeArray = ["text_utf8", "binary", "external_info", "reserved"];
