import { APEv2Parser } from "../apev2/APEv2Parser";
import { BasicParser } from "../common/BasicParser";
import { decodeLatin1 } from "../compat/text-decoder";
import initDebug from "../debug";
import { Genres } from "../parser/part/id3v1/genres";
import { readId3v1, ID3V1_SIZE } from "../parser/part/id3v1/id3v1";
import { EndOfStreamError } from "../peek-readable";

import type { IRandomReader } from "../type";

const debug = initDebug("music-metadata:parser:ID3v1");

export class ID3v1Parser extends BasicParser {
  public async parse(): Promise<void> {
    if (this.tokenizer.fileInfo.size === 0) {
      debug("Skip checking for ID3v1 because the file-size is unknown");
      return;
    }

    if (this.options.apeHeader) {
      void this.tokenizer.ignore(this.options.apeHeader.offset - this.tokenizer.position);
      const apeParser = new APEv2Parser();
      apeParser.init(this.metadata, this.tokenizer, this.options);
      await apeParser.parseTags(this.options.apeHeader.footer);
    }

    const offset = this.tokenizer.fileInfo.size - ID3V1_SIZE;
    if (this.tokenizer.position > offset) {
      debug("Already consumed the last 128 bytes");
      return;
    }

    // tokenizer read token
    const uint8Array = new Uint8Array(ID3V1_SIZE);
    const len = await this.tokenizer.readBuffer(uint8Array, { position: offset });
    if (len < ID3V1_SIZE) throw new EndOfStreamError();
    const header = readId3v1(uint8Array, 0);

    if (header) {
      debug("ID3v1 header found at: pos=%s", this.tokenizer.fileInfo.size - ID3V1_SIZE);
      for (const id of ["title", "artist", "album", "comment", "track", "year"] as const) {
        if (header[id] && header[id] !== "") this.addTag(id, header[id]);
      }
      const genre = getGenre(header.genre);
      if (genre) this.addTag("genre", genre);
    } else {
      debug("ID3v1 header not found at: pos=%s", this.tokenizer.fileInfo.size - ID3V1_SIZE);
    }
  }

  private addTag(id: string, value: any) {
    this.metadata.addTag("ID3v1", id, value);
  }
}

const getGenre = (genreIndex: number): string | undefined => {
  if (genreIndex < Genres.length) {
    return Genres[genreIndex];
  }
  return undefined; // ToDO: generate warning
};

/**
 *
 * @param reader
 */
export async function hasID3v1Header(reader: IRandomReader): Promise<boolean> {
  if (reader.fileSize >= 128) {
    const tag = new Uint8Array(3);
    await reader.randomRead(tag, 0, tag.length, reader.fileSize - 128);
    return decodeLatin1(tag) === "TAG";
  }
  return false;
}
