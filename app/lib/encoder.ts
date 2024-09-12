import EscPosEncoder from "esc-pos-encoder";
import { LINE_WIDTH } from "./constants";
import type { codepageType, EncoderOptions } from "esc-pos-encoder";

export const supportedCodePages: codepageType[] = [
  "cp437", // PC437: USA, Standard Europe
  "cp850", // PC850: Multilingual
  "cp860", // PC860: Portuguese
  "cp863", // PC863: Canadian-French
  "cp865", // PC865: Nordic
  "cp851", // PC851: Greek
  "cp853", // PC853: Turkish
  "cp857", // PC857: Turkish
  "cp737", // PC737: Greek
  "windows1252", // WPC1252
  "cp866", // PC866: Cyrillic #2
  "cp852", // PC852: Latin 2
  "cp858", // PC858: Euro
  "cp720", // PC720: Arabic
  "cp775", // WPC775: Baltic Rim
  "cp855", // PC855: Cyrillic
  "cp861", // PC861: Icelandic
  "cp862", // PC862: Hebrew
  "cp864", // PC864: Arabic
  "cp869", // PC869: Greek
  "iso88592", // ISO8859-2: Latin 2
  "iso88597", // ISO8859-7: Greek
  "iso885915", // ISO8859-15: Latin 9
  "cp1098", // PC1098: Farsi
  "cp1118", // PC1118: Lithuanian
  "cp1119", // PC1119: Lithuanian
  "cp1125", // PC1125: Ukrainian
  "windows1250", // WPC1250: Latin 2
  "windows1251", // WPC1251: Cyrillic
  "windows1253", // WPC1253: Greek
  "windows1254", // WPC1254: Turkish
  "windows1255", // WPC1255: Hebrew
  "windows1256", // WPC1256: Arabic
  "windows1257", // WPC1257: Baltic Rim
  "windows1258", // WPC1258: Vietnamese
  "rk1048", // KZ-1048: Kazakhstan
];

const defaultOptions: EncoderOptions = {
  width: LINE_WIDTH,
  wordWrap: true,
  codepageCandidates: supportedCodePages,
};

export const encoder = new EscPosEncoder(defaultOptions);

export const createEncoder = (options?: EncoderOptions) => {
  return new EscPosEncoder({ ...defaultOptions, ...options })
    .initialize()
    .codepage("auto");
};
