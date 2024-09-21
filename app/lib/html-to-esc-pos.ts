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
    if (node.type === "text") {
      let textContent = $(node).text();

      // Apply common replacements
      commonReplacements.forEach(({ search, replace }) => {
        textContent = textContent.replace(search, replace);
      });

      encoder.text(textContent);
    } else if (node.type === "tag") {
      const element = $(node);
      switch (node.name.toLowerCase()) {
        case "h1":
          encoder.bold(true).size(2);
          for (const child of element.contents().get()) {
            await processNode(child);
          }
          encoder.bold(false).size(1);
          encoder.newline();
          break;
        case "h2":
          encoder.bold(true);
          encoder.rule({ style: "double" });
          encoder.newline();
          encoder.text(element.text().toUpperCase());
          encoder.bold(false);
          encoder.newline();
          break;
        case "h3":
        case "h4":
        case "h5":
        case "h6":
          encoder.bold(true).align("center").invert(true);
          encoder.newline();
          encoder.text(" ");
          for (const child of element.contents().get()) {
            await processNode(child);
          }
          encoder.text(" ");
          encoder.newline();
          encoder.bold(false).align("left").invert(false);
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
          for (const child of element.contents().get()) {
            await processNode(child);
          }
          encoder.text(` [${element.attr("href") || ""}]`);
          encoder.underline(false);
          break;
        case "li":
          encoder.text("- ");
          for (const child of element.contents().get()) {
            await processNode(child);
          }
          encoder.newline();
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
              encoder.newline();
            }
          } catch (error) {
            console.error("Error processing image:", error);
          }
          break;
        case "blockquote":
          encoder.align("right").font("B");
          for (const child of element.contents().get()) {
            await processNode(child);
          }
          encoder.align("left").font("A");
          break;
        case "p":
          encoder.newline();
          for (const child of element.contents().get()) {
            await processNode(child);
          }
          encoder.newline();
          break;
        case "ul":
        case "ol":
          encoder.newline();
          for (const child of element.contents().get()) {
            await processNode(child);
          }
          encoder.newline();
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
