import EscPosEncoder from "esc-pos-encoder";
import * as net from "net";
import { QR_CODE_DEFAULTS, PRINTER_IP, PRINTER_PORT } from "./constants";

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

export function padAndCut(
  encoder: EscPosEncoder,
  lines: number = 7
): EscPosEncoder {
  for (let i = 0; i < lines; i++) {
    encoder = encoder.newline();
  }
  return encoder.cut();
}

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
