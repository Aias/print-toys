import type { APIRoute } from "astro";
import { encoder } from "@/lib/encoder";
import { commandsToPrintDataXML } from "@/lib/helpers";

export const POST: APIRoute = async ({ request }) => {
  const ENABLED = false;
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

  const { ResponseFile: responseFile, ...mainBody } = decodedParams;
  // Pretty print the decoded parameters
  console.log("Request received:");
  console.log(JSON.stringify(mainBody));

  if (responseFile) {
    console.log("Decoded ResponseFile:");
    console.log(responseFile);
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

  const xmlResponse = commandsToPrintDataXML(content, printJobId);

  if (ENABLED) {
    // Return the XML response
    return new Response(xmlResponse, {
      status: 200,
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
      },
    });
  } else {
    return new Response("Queue endpoint is disabled.", {
      status: 403,
    });
  }
};
