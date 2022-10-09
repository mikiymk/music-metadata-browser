import { BasicParser } from "../common/BasicParser";
import initDebug from "../debug";
import { matrsokaData } from "../parse-unit/matroska/data";
import { EBMLHeader, ebmlHeader } from "../parse-unit/matroska/ebml-header";
import { readUnitFromTokenizer } from "../parse-unit/utility/read-unit";
import { EndOfStreamError } from "../peek-readable/EndOfFileStream";

import { ContainerType, elements } from "./MatroskaDtd";
import { IMatroskaDoc, ITrackEntry, ITree, TargetType, TrackType } from "./types";

import type { INativeMetadataCollector } from "../common/INativeMetadataCollector";
import type { ITokenParser } from "../ParserFactory";
import type { ITokenizer } from "../strtok3/types";
import type { IOptions, ITrackInfo } from "../type";

const debug = initDebug("music-metadata:parser:matroska");

/**
 * Extensible Binary Meta Language (EBML) parser
 * https://en.wikipedia.org/wiki/Extensible_Binary_Meta_Language
 * http://matroska.sourceforge.net/technical/specs/rfc/index.html
 *
 * WEBM VP8 AUDIO FILE
 */
export class MatroskaParser extends BasicParser {
  private padding = 0;

  private ebmlMaxIDLength = 4;
  private ebmlMaxSizeLength = 8;

  /**
   * Initialize parser with output (metadata), input (tokenizer) & parsing options (options).
   * @param {INativeMetadataCollector} metadata Output
   * @param {ITokenizer} tokenizer Input
   * @param {IOptions} options Parsing options
   * @returns
   */
  public override init(metadata: INativeMetadataCollector, tokenizer: ITokenizer, options: IOptions): ITokenParser {
    super.init(metadata, tokenizer, options);
    return this;
  }

  public async parse(): Promise<void> {
    const matroska = (await this.parseContainer(elements, this.tokenizer.fileInfo.size, [])) as any as IMatroskaDoc;

    this.metadata.setFormat("container", `EBML/${matroska.ebml.docType}`);
    if (matroska.segment) {
      const info = matroska.segment.info;
      if (info) {
        const timecodeScale = info.timecodeScale ?? 1_000_000;
        const duration = (info.duration * timecodeScale) / 1_000_000_000;
        this.addTag("segment:title", info.title);
        this.metadata.setFormat("duration", duration);
      }

      const audioTracks = matroska.segment.tracks;
      if (audioTracks?.entries) {
        for (const entry of audioTracks.entries) {
          const stream: ITrackInfo = {
            codecName: entry.codecID.replace("A_", "").replace("V_", ""),
            codecSettings: entry.codecSettings,
            flagDefault: entry.flagDefault,
            flagLacing: entry.flagLacing,
            flagEnabled: entry.flagEnabled,
            language: entry.language,
            name: entry.name,
            type: entry.trackType,
            audio: entry.audio,
            video: entry.video,
          };
          this.metadata.addStreamInfo(stream);
        }

        const audioTrack = audioTracks.entries
          .filter((entry) => {
            return entry.trackType === TrackType.audio.valueOf();
          })
          // eslint-disable-next-line unicorn/no-array-reduce
          .reduce<ITrackEntry | null>((previousValue, currentValue) => {
            if (!previousValue) {
              return currentValue;
            }
            if (!previousValue.flagDefault && currentValue.flagDefault) {
              return currentValue;
            }
            if (currentValue.trackNumber && currentValue.trackNumber < previousValue.trackNumber) {
              return currentValue;
            }
            return previousValue;
          }, null);

        if (audioTrack) {
          this.metadata.setFormat("codec", audioTrack.codecID.replace("A_", ""));
          this.metadata.setFormat("sampleRate", audioTrack.audio.samplingFrequency);
          this.metadata.setFormat("numberOfChannels", audioTrack.audio.channels);
        }

        if (matroska.segment.tags) {
          for (const tag of matroska.segment.tags.tag) {
            const target = tag.target;
            const targetType = target?.targetTypeValue
              ? TargetType[target.targetTypeValue]
              : target?.targetType ?? "track";
            for (const simpleTag of tag.simpleTags) {
              const value = simpleTag.string ?? simpleTag.binary;
              this.addTag(`${targetType}:${simpleTag.name}`, value);
            }
          }
        }

        if (matroska.segment.attachments) {
          for (const picture of matroska.segment.attachments.attachedFiles
            .filter((file) => file.mimeType.startsWith("image/"))
            .map((file) => {
              return {
                data: file.data,
                format: file.mimeType,
                description: file.description,
                name: file.name,
              };
            })) {
            this.addTag("picture", picture);
          }
        }
      }
    }
  }

  private async parseContainer(container: ContainerType, posDone: number, path: string[]): Promise<ITree> {
    const tree: ITree = {};
    while (this.tokenizer.position < posDone) {
      let element: EBMLHeader;
      try {
        element = await ebmlHeader(this.tokenizer);
      } catch (error) {
        if (error instanceof EndOfStreamError) {
          break;
        }
        throw error;
      }
      const type = container[element.id];
      if (type) {
        debug(`Element: name=${type.name}, container=${"container" in type}`);
        if ("container" in type) {
          const res = await this.parseContainer(
            type.container,
            element.length >= 0 ? this.tokenizer.position + element.length : -1,
            [...path, type.name]
          );
          if (type.multiple) {
            if (!tree[type.name]) {
              tree[type.name] = [];
            }
            (tree[type.name] as ITree[]).push(res);
          } else {
            tree[type.name] = res;
          }
        } else {
          tree[type.name] = await readUnitFromTokenizer(this.tokenizer, matrsokaData(type.value, element.length));
        }
      } else {
        switch (element.id) {
          case 0xec: // void
            this.padding += element.length;
            await this.tokenizer.ignore(element.length);
            break;
          default:
            debug(`parseEbml: path=${path.join("/")}, unknown element: id=${element.id.toString(16)}`);
            this.padding += element.length;
            await this.tokenizer.ignore(element.length);
        }
      }
    }
    return tree;
  }

  private addTag(tagId: string, value: any) {
    this.metadata.addTag("matroska", tagId, value);
  }
}
