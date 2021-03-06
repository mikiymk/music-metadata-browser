import * as fs from "node:fs/promises";
import { FileTokenizer } from "./FileTokenizer";

/**
 *
 * @param sourceFilePath
 */
export async function fromFile(sourceFilePath: string): Promise<FileTokenizer> {
  const stat = await fs.stat(sourceFilePath);
  if (!stat.isFile) {
    throw new Error(`File not a file: ${sourceFilePath}`);
  }
  const fd = await fs.open(sourceFilePath, "r");
  return new FileTokenizer(fd, { path: sourceFilePath, size: stat.size });
}
