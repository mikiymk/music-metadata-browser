import { Buffer } from "node:buffer";
import { fileTypeFromBuffer, FileTypeResult } from "./core";

/**
 * Convert Blobs to ArrayBuffer.
 * @param blob - Web API Blob.
 * @returns
 */
function blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  if (blob.arrayBuffer) {
    return blob.arrayBuffer();
  }

  // TODO: Remove when stop supporting older environments
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.addEventListener("loadend", (event) => {
      resolve(event.target.result as ArrayBuffer);
    });

    fileReader.addEventListener("error", (event) => {
      reject(new Error(event.toString()));
    });

    fileReader.addEventListener("abort", (event) => {
      reject(new Error(event.type));
    });

    fileReader.readAsArrayBuffer(blob);
  });
}

/**
 * Detect the file type of a [`Blob`](https://developer.mozilla.org/en-US/docs/Web/API/Blob).
 *
 * __Note:__ This method is only available in the browser.
 * @example
 * ```
 * import {fileTypeFromBlob} from 'file-type';
 *
 * const blob = new Blob(['<?xml version="1.0" encoding="ISO-8859-1" ?>'], {
 * 	type: 'plain/text',
 * 	endings: 'native'
 * });
 *
 * console.log(await fileTypeFromBlob(blob));
 * //=> {ext: 'txt', mime: 'plain/text'}
 * ```
 */
export async function fileTypeFromBlob(
  blob: Blob
): Promise<FileTypeResult | undefined> {
  const buffer = await blobToArrayBuffer(blob);
  return fileTypeFromBuffer(Buffer.from(buffer));
}

export {
  fileTypeFromTokenizer,
  fileTypeFromBuffer,
  fileTypeStream,
} from "./core";
export {
  supportedExtensions,
  supportedMimeTypes,
  FileTypeResult,
  FileExtension,
  MimeType,
} from "./core";