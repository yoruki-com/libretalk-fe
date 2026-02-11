/* eslint-disable @typescript-eslint/no-require-imports */

interface Sticker {
  id: string;
  source: number;
}

export const HELLO_STICKERS: Sticker[] = [
  { id: "hello/001-hindi", source: require("@/assets/images/stickers/svg/hello/001-hindi.svg") },
  { id: "hello/002-morse-code", source: require("@/assets/images/stickers/svg/hello/002-morse code.svg") },
  { id: "hello/003-english", source: require("@/assets/images/stickers/svg/hello/003-english.svg") },
  { id: "hello/004-arabic", source: require("@/assets/images/stickers/svg/hello/004-arabic.svg") },
  { id: "hello/005-roman", source: require("@/assets/images/stickers/svg/hello/005-roman.svg") },
  { id: "hello/006-spanish", source: require("@/assets/images/stickers/svg/hello/006-spanish.svg") },
  { id: "hello/007-translator", source: require("@/assets/images/stickers/svg/hello/007-translator.svg") },
  { id: "hello/008-neanderthal", source: require("@/assets/images/stickers/svg/hello/008-neanderthal.svg") },
  { id: "hello/009-hieroglyph", source: require("@/assets/images/stickers/svg/hello/009-Hieroglyph.svg") },
  { id: "hello/010-bark", source: require("@/assets/images/stickers/svg/hello/010-bark.svg") },
  { id: "hello/011-languages", source: require("@/assets/images/stickers/svg/hello/011-languages.svg") },
  { id: "hello/012-greek", source: require("@/assets/images/stickers/svg/hello/012-greek.svg") },
  { id: "hello/013-binary-code", source: require("@/assets/images/stickers/svg/hello/013-binary code.svg") },
  { id: "hello/014-french", source: require("@/assets/images/stickers/svg/hello/014-french.svg") },
  { id: "hello/015-japanese", source: require("@/assets/images/stickers/svg/hello/015-japanese.svg") },
  { id: "hello/016-chinese", source: require("@/assets/images/stickers/svg/hello/016-chinese.svg") },
  { id: "hello/017-pig", source: require("@/assets/images/stickers/svg/hello/017-pig.svg") },
  { id: "hello/018-martian", source: require("@/assets/images/stickers/svg/hello/018-martian.svg") },
  { id: "hello/019-viking", source: require("@/assets/images/stickers/svg/hello/019-viking.svg") },
  { id: "hello/020-italian", source: require("@/assets/images/stickers/svg/hello/020-italian.svg") },
];

const STICKER_MAP = new Map(HELLO_STICKERS.map((s) => [s.id, s]));

export function getRandomHelloSticker(): Sticker {
  return HELLO_STICKERS[Math.floor(Math.random() * HELLO_STICKERS.length)];
}

export function getStickerById(id: string): Sticker | undefined {
  return STICKER_MAP.get(id);
}
