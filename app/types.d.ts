// CSS module declarations for tsgo (Next.js plugin handles this in tsc)
declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}

// @point-of-sale/receipt-printer-encoder has no type declarations
declare module '@point-of-sale/receipt-printer-encoder' {
  interface EncoderOptions {
    printerModel?: string;
    feedBeforeCut?: number;
    imageMode?: string;
    createCanvas?: (width: number, height: number, type?: 'pdf' | 'svg') => unknown;
  }

  interface BoxOptions {
    paddingLeft?: number;
    paddingRight?: number;
    style?: string;
    align?: string;
  }

  interface RuleOptions {
    style?: string;
  }

  class ReceiptPrinterEncoder {
    constructor(options?: EncoderOptions);
    initialize(): ReceiptPrinterEncoder;
    codepage(codepage: string): ReceiptPrinterEncoder;
    text(text: string): ReceiptPrinterEncoder;
    line(text: string): ReceiptPrinterEncoder;
    newline(): ReceiptPrinterEncoder;
    bold(enabled: boolean): ReceiptPrinterEncoder;
    italic(enabled: boolean): ReceiptPrinterEncoder;
    underline(enabled: boolean): ReceiptPrinterEncoder;
    invert(enabled: boolean): ReceiptPrinterEncoder;
    size(size: number): ReceiptPrinterEncoder;
    width(width: number): ReceiptPrinterEncoder;
    height(height: number): ReceiptPrinterEncoder;
    font(font: string): ReceiptPrinterEncoder;
    align(alignment: string): ReceiptPrinterEncoder;
    table(columns: unknown[], data: unknown[][]): ReceiptPrinterEncoder;
    rule(options?: RuleOptions): ReceiptPrinterEncoder;
    box(options: BoxOptions, text: string): ReceiptPrinterEncoder;
    barcode(data: string, symbology: string, height?: number): ReceiptPrinterEncoder;
    qrcode(data: string, model?: number, size?: number, errorLevel?: string): ReceiptPrinterEncoder;
    pdf417(data: string): ReceiptPrinterEncoder;
    image(image: unknown, width: number, height: number, algorithm?: string): ReceiptPrinterEncoder;
    cut(): ReceiptPrinterEncoder;
    pulse(): ReceiptPrinterEncoder;
    raw(data: number[]): ReceiptPrinterEncoder;
    encode(): Uint8Array;
    [method: string]: unknown;
  }

  export default ReceiptPrinterEncoder;
}
