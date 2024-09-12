import EscPosEncoder from "esc-pos-encoder";
import * as net from "net";
import { QR_CODE_DEFAULTS, PRINTER_IP, PRINTER_PORT } from "./constants";
import { parseString } from "xml2js";
import { promisify } from "util";

// Add this type definition at the top of the file
type PrintResponseResult = {
  PrintResponseInfo: {
    $: { Version: string };
    ServerDirectPrint: Array<any>;
    ePOSPrint?: Array<any>;
  };
};

const parseXml = promisify(parseString);

export async function parsePrinterResponse(responseFile: string) {
  try {
    const result = (await parseXml(responseFile)) as PrintResponseResult;
    const printResponseInfo = result.PrintResponseInfo;

    if (!printResponseInfo || printResponseInfo.$.Version !== "3.00") {
      throw new Error("Invalid or unsupported PrintResponseInfo version");
    }

    const serverDirectPrint = printResponseInfo.ServerDirectPrint[0];
    const ePOSPrint = printResponseInfo.ePOSPrint
      ? printResponseInfo.ePOSPrint[0]
      : null;

    return {
      fullXml: responseFile,
      serverDirectPrintSuccess:
        serverDirectPrint.Response[0].$.Success === "true",
      serverDirectPrintErrorSummary:
        serverDirectPrint.Response[0].ErrorSummary?.[0],
      serverDirectPrintErrorDetail:
        serverDirectPrint.Response[0].ErrorDetail?.[0],
      printerDeviceId: ePOSPrint?.Parameter[0].devid[0],
      printerJobId: ePOSPrint?.Parameter[0].printjobid[0],
      printerSuccess:
        ePOSPrint?.PrintResponse[0].response[0].$.success === "true",
      printerCode: ePOSPrint?.PrintResponse[0].response[0].$.code,
      printerStatus: ePOSPrint?.PrintResponse[0].response[0].$.status,
    };
  } catch (error) {
    console.error("Error parsing printer response:", error);
    throw error;
  }
}

export function addDefaultQRCode(
  encoder: EscPosEncoder,
  url: string
): EscPosEncoder {
  return encoder.qrcode(
    url,
    QR_CODE_DEFAULTS.model,
    QR_CODE_DEFAULTS.size,
    QR_CODE_DEFAULTS.errorLevel
  );
}

export const createFeedCutCommand = (
  additionalFeed: number = 0
): Uint8Array => {
  // Constants
  const DEFAULT_VERTICAL_MOTION_UNIT = 360; // 1/360 inch as per default GS P setting
  const PRINT_HEAD_TO_CUTTER_DISTANCE = 15; // 15mm from print head to autocutter
  const POST_CUT_FEED = 1; // 1mm feed after cut for best results
  const MM_PER_INCH = 25.4;

  // Convert mm to dots
  const mmToDots = (mm: number): number =>
    Math.round((mm * DEFAULT_VERTICAL_MOTION_UNIT) / MM_PER_INCH);

  // Calculate feed amounts
  const cutterFeed = mmToDots(PRINT_HEAD_TO_CUTTER_DISTANCE + additionalFeed);
  const postCutFeed = mmToDots(POST_CUT_FEED);

  // Prepare the command
  const command = [
    0x1d,
    0x56,
    66,
    cutterFeed, // GS V <Function B>: Feed and partial cut
    0x1b,
    0x4a,
    postCutFeed, // ESC d: Feed n dots
  ];

  return new Uint8Array(command);
};

export const feedAndCutCommand = createFeedCutCommand();

export async function sendToPrinter(data: Uint8Array, debug: boolean = false) {
  return new Promise<void>((resolve, reject) => {
    const client = new net.Socket();
    if (debug) console.log("Connecting to printer...");

    client.connect(PRINTER_PORT, PRINTER_IP, () => {
      if (debug) console.log("Connected to printer.");
      client.write(data);
      client.end();
      resolve();
    });

    client.on("error", (err) => {
      reject(err);
    });
  });
}

// Convert Uint8Array to Hex string
export const uint8ArrayToHex = (content: Uint8Array) =>
  Array.from(content)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();

// Create a test print XML response
export const commandsToPrintDataXML = (
  escPosCommands: Uint8Array,
  printJobId?: string
) => {
  const hexContent = uint8ArrayToHex(escPosCommands);
  const id = printJobId || crypto.randomUUID().substring(0, 30);
  return `<?xml version="1.0" encoding="UTF-8"?>
  <PrintRequestInfo Version="3.00">
    <ePOSPrint>
      <Parameter>
        <devid>local_printer</devid>
        <timeout>10000</timeout>
        <printjobid>${id}</printjobid>
      </Parameter>
      <PrintData>
        <epos-print xmlns="http://www.epson-pos.com/schemas/2011/03/epos-print">
          <command>${hexContent}</command>
        </epos-print>
      </PrintData>
    </ePOSPrint>
  </PrintRequestInfo>`;
};
