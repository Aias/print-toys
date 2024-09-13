import { AnyNode } from "node_modules/domhandler/lib/esm/node";
import { createEncoder } from "./encoder";
import * as cheerio from "cheerio";
import { processImage } from "./helpers";

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
          encoder.bold(true).height(2).width(2);
          await Promise.all(
            element.contents().map((_, child) => processNode(child))
          );
          encoder.bold(false).height(1).width(1);
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
          await Promise.all(
            element.contents().map((_, child) => processNode(child))
          );
          encoder.text(" ");
          encoder.newline();
          encoder.bold(false).align("left").invert(false);
          break;
        case "b":
        case "strong":
          encoder.bold(true);
          await Promise.all(
            element.contents().map((_, child) => processNode(child))
          );
          encoder.bold(false);
          break;
        case "i":
        case "em":
          encoder.bold(true); // Italics not supported, so using bold for emphasis.
          await Promise.all(
            element.contents().map((_, child) => processNode(child))
          );
          encoder.bold(false);
          break;
        case "u":
          encoder.underline(true);
          await Promise.all(
            element.contents().map((_, child) => processNode(child))
          );
          encoder.underline(false);
          break;
        case "a":
          encoder.underline(true);
          await Promise.all(
            element.contents().map((_, child) => processNode(child))
          );
          encoder.text(` [${element.attr("href") || ""}]`);
          encoder.underline(false);
          break;
        case "li":
          encoder.text("- ");
          await Promise.all(
            element.contents().map((_, child) => processNode(child))
          );
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
              const { canvas, width, height } = await processImage(src);
              encoder.image(canvas, width, height, "floydsteinberg");
            }
          } catch (error) {
            console.error("Error processing image:", error);
          }
          break;
        case "blockquote":
          encoder.align("right").size("small");
          await Promise.all(
            element.contents().map((_, child) => processNode(child))
          );
          encoder.align("left").size("normal");
          break;
        case "p":
          encoder.newline();
          await Promise.all(
            element.contents().map((_, child) => processNode(child))
          );
          encoder.newline();
          break;
        case "ul":
        case "ol":
          encoder.newline();
          await Promise.all(
            element.contents().map((_, child) => processNode(child))
          );
          encoder.newline();
          break;
        case "div":
        case "span":
        default:
          await Promise.all(
            element.contents().map((_, child) => processNode(child))
          );
      }
    }
  }

  // Process all nodes
  await Promise.all(
    $("body")
      .contents()
      .map((_, node) => processNode(node))
      .get()
  );

  return encoder.encode();
}
