import { expect, test } from "vitest";
import { join } from "node:path";

import { parseFile } from "../lib";
import { samplePath } from "./util";

test("should read utf16bom (big endian) encoded metadata correctly", async () => {
  const filename = "bug-utf16bom-encoding.mp3";
  const filePath = join(samplePath, filename);

  const metadata = await parseFile(filePath);
  const common = metadata.common;

  expect(common.title, "title").toBe("It's All Over You Know");
  expect(common.artist, "artist").toBe("The Apers");
  expect(common.artists, "artist").toStrictEqual(["The Apers"]);
  expect(common.albumartist, "albumartist").toBe("The Apers");
  expect(common.album, "album").toBe("Reanimate My Heart");
  expect(common.year, "year").toBe(2007);
  expect(common.track, "track").toStrictEqual({ no: 1, of: null });
  expect(common.genre, "genre").toStrictEqual(["Punk Rock"]);
});
