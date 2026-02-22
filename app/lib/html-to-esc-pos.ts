import { AnyNode } from "domhandler";
import { createEncoder } from "./encoder";
import * as cheerio from "cheerio";
import { urlToCanvasImage, rawDataToCanvasImage } from "./image-processing";

export const commonReplacements = [
  // {
  //   search: /[\u201C\u201D""]/g,
  //   replace: '"',
  // },
  // {
  //   search: /[\u2018\u2019'']/g,
  //   replace: "'",
  // },
  // {
  //   search: /[–—]/g,
  //   replace: "-",
  // },
  {
    search: /\n/g,
    replace: "",
  },
  {
    search: /\r/g,
    replace: "",
  },
  {
    search: /\s+/g,
    replace: " ",
  },
];

export async function htmlToEscPos(html: string): Promise<Uint8Array> {
  let encoder = createEncoder();
  const $ = cheerio.load(html);

  async function processNode(node: AnyNode) {
    const $node = $(node);

    if (node.type === "text") {
      let textContent = $node.text();

      // Only process non-empty text nodes
      if (textContent.trim().length > 0) {
        // Your existing text processing logic here
        encoder.text(`${textContent}`);
      }
    } else if (node.type === "tag") {
      const element = $(node);
      switch (node.name.toLowerCase()) {
        case "h1":
          encoder.bold(true).size(2);
          encoder.text(element.text().trim());
          encoder.bold(false).size(1);
          encoder.newline();
          break;
        case "h2":
          encoder.bold(true);
          encoder.rule({ style: "double" });
          encoder.newline();
          encoder.line(`${element.text().trim().toUpperCase()}`);
          encoder.bold(false);
          break;
        case "h3":
        case "h4":
        case "h5":
        case "h6":
          encoder.newline();
          encoder.bold(true).invert(true);
          encoder.align("center");
          encoder.line(`[ ${element.text().trim()} ]`);
          encoder.align("left");
          encoder.bold(false).invert(false);
          break;
        case "b":
        case "strong":
          encoder.bold(true);
          for (const child of element.contents().get()) {
            await processNode(child);
          }
          encoder.bold(false);
          break;
        case "i":
        case "em":
          encoder.bold(true); // Italics not supported, so using bold for emphasis.
          for (const child of element.contents().get()) {
            await processNode(child);
          }
          encoder.bold(false);
          break;
        case "u":
          encoder.underline(true);
          for (const child of element.contents().get()) {
            await processNode(child);
          }
          encoder.underline(false);
          break;
        case "a":
          encoder.underline(true);
          encoder.text(`${element.text()} [${element.attr("href") || ""}]`);
          encoder.underline(false);
          break;
        case "br":
          encoder.newline();
          break;
        case "hr":
          encoder.newline();
          encoder.rule({ style: "single" });
          break;
        case "img":
          try {
            const src = element.attr("src");
            if (src) {
              let processedImage;
              if (src.startsWith("data:image")) {
                // Handle base64 encoded images
                const rawData = Buffer.from(src.split(",")[1], "base64");
                processedImage = await rawDataToCanvasImage(rawData);
              } else {
                processedImage = await urlToCanvasImage(src);
              }
              const { canvas, width, height } = processedImage;
              encoder.image(canvas, width, height, "floydsteinberg");
            }
          } catch (error) {
            console.error("Error processing image:", error);
            // Continue with rest of document - don't fail entire print job
            encoder.line("[Image failed to load]");
          }
          break;
        case "blockquote":
          encoder.font("B").align("right");
          for (const child of element.contents().get()) {
            await processNode(child);
          }
          encoder.font("A").align("left");
          break;
        case "pre": {
          const text = element.text().replace(/^\n|\n$/g, "");
          const lines = text.split("\n");

          encoder.font("B");
          // ESC 3 n: set line spacing to 20 dots (17-dot glyph + 3-dot gap)
          encoder.raw([0x1b, 0x33, 20]);

          for (const line of lines) {
            encoder.raw(Array.from(new TextEncoder().encode(line)));
            encoder.newline();
          }

          // ESC 2: reset default line spacing
          encoder.raw([0x1b, 0x32]);
          encoder.font("A");
          break;
        }
        case "code":
          encoder.font("B");
          encoder.box(
            {
              paddingLeft: 2,
              paddingRight: 2,
              style: "single",
              align: "left",
            },
            element.text().trim(),
          );
          encoder.font("A");
          break;
        case "p":
        case "ul":
        case "ol":
          encoder.newline();
          for (const child of element.contents().get()) {
            await processNode(child);
          }
          encoder.newline();
          break;
        case "li":
          encoder.text("- ");
          for (const child of element.contents().get()) {
            await processNode(child);
          }
          if (element.next("li").length) {
            encoder.newline();
          }
          break;
        case "div":
        case "span":
        default:
          for (const child of element.contents().get()) {
            await processNode(child);
          }
      }
    }
  }

  // Process all nodes sequentially
  for (const node of $("body").contents().get()) {
    await processNode(node);
  }

  return encoder.cut().encode();
}
