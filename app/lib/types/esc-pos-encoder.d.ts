declare module "esc-pos-encoder" {
  export type codepageType =
    | "cp437" // PC437: USA, Standard Europe
    | "cp850" // PC850: Multilingual
    | "cp860" // PC860: Portuguese
    | "cp863" // PC863: Canadian-French
    | "cp865" // PC865: Nordic
    | "cp851" // PC851: Greek
    | "cp853" // PC853: Turkish
    | "cp857" // PC857: Turkish
    | "cp737" // PC737: Greek
    | "windows1252" // WPC1252
    | "cp866" // PC866: Cyrillic #2
    | "cp852" // PC852: Latin 2
    | "cp858" // PC858: Euro
    | "cp720" // PC720: Arabic
    | "cp775" // WPC775: Baltic Rim
    | "cp855" // PC855: Cyrillic
    | "cp861" // PC861: Icelandic
    | "cp862" // PC862: Hebrew
    | "cp864" // PC864: Arabic
    | "cp869" // PC869: Greek
    | "iso88592" // ISO8859-2: Latin 2
    | "iso88597" // ISO8859-7: Greek
    | "iso885915" // ISO8859-15: Latin 9
    | "cp1098" // PC1098: Farsi
    | "cp1118" // PC1118: Lithuanian
    | "cp1119" // PC1119: Lithuanian
    | "cp1125" // PC1125: Ukrainian
    | "windows1250" // WPC1250: Latin 2
    | "windows1251" // WPC1251: Cyrillic
    | "windows1253" // WPC1253: Greek
    | "windows1254" // WPC1254: Turkish
    | "windows1255" // WPC1255: Hebrew
    | "windows1256" // WPC1256: Arabic
    | "windows1257" // WPC1257: Baltic Rim
    | "windows1258" // WPC1258: Vietnamese
    | "rk1048"; // KZ-1048: Kazakhstan (assuming rk1048 is equivalent)

  type sizeType = "small" | "normal";

  type alignType = "left" | "center" | "right";
  type verticalAlignType = "top" | "bottom";

  type symbologyType =
    | "upca"
    | "upce"
    | "ean13"
    | "ean8"
    | "code39"
    | "itf"
    | "codabar"
    | "code93"
    | "code128"
    | "gs1-128"
    | "gs1-databar-omni"
    | "gs1-databar-truncated"
    | "gs1-databar-limited"
    | "gs1-databar-expanded"
    | "code128-auto";

  type qrSizeType = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  type qrErrorLevelType = "l" | "m" | "q" | "h";

  type imgAlgType = "threshold" | "bayer" | "floydsteinberg" | "atkinson";

  type cutType = "full" | "partial";

  type styleType = "single" | "double";

  type deviceType = 0 | 1;

  interface BoxOptions {
    marginLeft?: number;
    marginRight?: number;
    paddingLeft?: number;
    paddingRight?: number;
    style?: styleType;
    width?: number;
    align?: alignType;
  }

  interface TableColumn {
    align?: alignType;
    marginLeft?: number;
    marginRight?: number;
    verticalAlign?: verticalAlignType;
    width?: number;
  }

  interface RuleOptions {
    style?: styleType;
    width?: number;
  }

  export interface EncoderOptions {
    width?: number;
    embedded?: boolean;
    wordWrap?: boolean;
    imageMode?: "column" | "raster";
    codepageMapping?: string | Record<string, number>;
    codepageCandidates?: codepageType[];
    createCanvas?: Function;
  }

  declare class EscPosEncoder {
    constructor(options?: EncoderOptions);

    align(value: alignType): EscPosEncoder;

    barcode(
      value: string,
      symbology: symbologyType,
      height: number
    ): EscPosEncoder;

    bold(value?: boolean): EscPosEncoder;

    codepage(value: codepageType | "auto"): EscPosEncoder;

    cut(value?: cutType): EscPosEncoder;

    encode(): Uint8Array;

    image(
      element: any,
      width: number,
      height: number,
      algorithm?: imgAlgType,
      threshold?: number
    ): EscPosEncoder;

    initialize(): EscPosEncoder;

    italic(value?: boolean): EscPosEncoder;

    line(value: string, wrap?: number): EscPosEncoder;

    newline(): EscPosEncoder;

    qrcode(
      value: string,
      model?: 1 | 2,
      size?: qrSizeType,
      errorLevel?: qrErrorLevelType
    ): EscPosEncoder;

    raw(data: readonly number[] | Uint8Array): EscPosEncoder;

    size(value: sizeType): EscPosEncoder;

    text(value: string, wrap?: number): EscPosEncoder;

    underline(value?: boolean | 2): EscPosEncoder;

    invert(value?: boolean): EscPosEncoder;

    width(value: number): EscPosEncoder;

    height(value: number): EscPosEncoder;

    box(
      options: BoxOptions,
      value: string | ((encoder: EscPosEncoder) => EscPosEncoder)
    ): EscPosEncoder;

    table(
      columns: ReadonlyArray<TableColumn>,
      data: ReadonlyArray<
        ReadonlyArray<string | ((encoder: EscPosEncoder) => EscPosEncoder)>
      >
    ): EscPosEncoder;

    rule(options?: RuleOptions): EscPosEncoder;

    pulse(device: deviceType, on: number, off: number): EscPosEncoder;
  }

  export = EscPosEncoder;
}
