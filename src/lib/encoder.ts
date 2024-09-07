import EscPosEncoder from "esc-pos-encoder";
import { LINE_WIDTH } from "./constants";

export const encoder = new EscPosEncoder({
  width: LINE_WIDTH,
  wordWrap: true,
}).codepage("auto");
