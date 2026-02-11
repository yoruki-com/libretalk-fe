/* eslint-disable @typescript-eslint/no-require-imports */
import type { SvgProps } from "react-native-svg";
import type { ComponentType } from "react";

export interface Sticker {
  id: string;
  Component: ComponentType<SvgProps>;
}

export const HELLO_STICKERS: Sticker[] = [
  { id: "hello/001-hindi", Component: require("@/assets/images/stickers/svg/hello/001-hindi.svg").default },
  { id: "hello/002-morse-code", Component: require("@/assets/images/stickers/svg/hello/002-morse code.svg").default },
  { id: "hello/003-english", Component: require("@/assets/images/stickers/svg/hello/003-english.svg").default },
  { id: "hello/004-arabic", Component: require("@/assets/images/stickers/svg/hello/004-arabic.svg").default },
  { id: "hello/005-roman", Component: require("@/assets/images/stickers/svg/hello/005-roman.svg").default },
  { id: "hello/006-spanish", Component: require("@/assets/images/stickers/svg/hello/006-spanish.svg").default },
  { id: "hello/007-translator", Component: require("@/assets/images/stickers/svg/hello/007-translator.svg").default },
  { id: "hello/008-neanderthal", Component: require("@/assets/images/stickers/svg/hello/008-neanderthal.svg").default },
  { id: "hello/009-hieroglyph", Component: require("@/assets/images/stickers/svg/hello/009-Hieroglyph.svg").default },
  { id: "hello/010-bark", Component: require("@/assets/images/stickers/svg/hello/010-bark.svg").default },
  { id: "hello/011-languages", Component: require("@/assets/images/stickers/svg/hello/011-languages.svg").default },
  { id: "hello/012-greek", Component: require("@/assets/images/stickers/svg/hello/012-greek.svg").default },
  { id: "hello/013-binary-code", Component: require("@/assets/images/stickers/svg/hello/013-binary code.svg").default },
  { id: "hello/014-french", Component: require("@/assets/images/stickers/svg/hello/014-french.svg").default },
  { id: "hello/015-japanese", Component: require("@/assets/images/stickers/svg/hello/015-japanese.svg").default },
  { id: "hello/016-chinese", Component: require("@/assets/images/stickers/svg/hello/016-chinese.svg").default },
  { id: "hello/017-pig", Component: require("@/assets/images/stickers/svg/hello/017-pig.svg").default },
  { id: "hello/018-martian", Component: require("@/assets/images/stickers/svg/hello/018-martian.svg").default },
  { id: "hello/019-viking", Component: require("@/assets/images/stickers/svg/hello/019-viking.svg").default },
  { id: "hello/020-italian", Component: require("@/assets/images/stickers/svg/hello/020-italian.svg").default },
];

const STICKER_MAP = new Map(HELLO_STICKERS.map((s) => [s.id, s]));

export function getRandomHelloSticker(): Sticker {
  return HELLO_STICKERS[Math.floor(Math.random() * HELLO_STICKERS.length)];
}

export function getStickerById(id: string): Sticker | undefined {
  return STICKER_MAP.get(id);
}
