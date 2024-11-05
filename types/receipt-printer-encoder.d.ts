declare module "@point-of-sale/receipt-printer-encoder" {
  interface EncoderOptions {
    printerModel?: string;
    width?: number;
    feedBeforeCut?: number;
    imageMode?: "column" | "raster";
    createCanvas?: Function;
    debug?: boolean;
    embedded?: boolean;
  }

  class ReceiptPrinterEncoder {
    constructor(options?: EncoderOptions);
    initialize(): this;
    codepage(page: string): this;
    text(content: string): this;
    newline(): this;
    line(content: string): this;
    bold(enabled: boolean): this;
    underline(enabled: boolean): this;
    invert(enabled: boolean): this;
    align(alignment: "left" | "center" | "right"): this;
    size(value: number): this;
    font(type: string): this;
    image(
      input: any,
      width: number,
      height: number,
      algorithm?: "threshold" | "bayer" | "floydsteinberg" | "atkinson"
    ): this;
    cut(type?: "full" | "partial"): this;
    encode(format?: "array" | "commands" | "lines"): Uint8Array;
  }

  export default ReceiptPrinterEncoder;
}
