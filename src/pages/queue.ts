import type { APIRoute } from "astro";
import { encoder } from "../lib/encoder";

export const GET: APIRoute = async () => {
  return new Response("Queue endpoint is working");
};

export const POST: APIRoute = async ({ request }) => {
  // Log the request
  const bodyText = await request.text();

  // Parse the URL-encoded body
  const params = new URLSearchParams(bodyText);

  // Create an object to store the decoded parameters
  const decodedParams: Record<string, string> = {};

  // Decode each parameter
  for (const [key, value] of params.entries()) {
    decodedParams[key] = decodeURIComponent(value);
  }

  // Pretty print the decoded parameters
  console.log("Request received:");
  console.log(JSON.stringify(decodedParams, null, 2));

  // If you want to specifically log the ResponseFile content:
  if (decodedParams.ResponseFile) {
    console.log("Decoded ResponseFile:");
    console.log(decodedParams.ResponseFile);
  }

  const printJobId = crypto.randomUUID().substring(0, 30);
  const content = encoder
    .initialize()
    .line("Hello, world!")
    .newline()
    .line("Another line.")
    .rule()
    .qrcode("https://google.com")
    .newline()
    .newline()
    .newline()
    .newline()
    .newline()
    .newline()
    .cut()
    .encode();

  // Convert Uint8Array to Hex string
  const hexContent = Array.from(content)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();

  // Create a test print XML response
  const xmlResponse = `<?xml version="1.0" encoding="UTF-8"?>
    <PrintRequestInfo Version="3.00">
      <ePOSPrint>
        <Parameter>
          <devid>local_printer</devid>
          <timeout>10000</timeout>
          <printjobid>${printJobId}</printjobid>
        </Parameter>
        <PrintData>
          <epos-print xmlns="http://www.epson-pos.com/schemas/2011/03/epos-print">
            <command>${hexContent}</command>
          </epos-print>
        </PrintData>
      </ePOSPrint>
    </PrintRequestInfo>`;

  // Return the XML response
  return new Response(xmlResponse, {
    status: 200,
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
    },
  });
};
