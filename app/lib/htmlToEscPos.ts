import { AnyNode } from "node_modules/domhandler/lib/esm/node";
import { encoder } from "./encoder";
import * as cheerio from "cheerio";

export const commonReplacements = [
  {
    search: /[\u201C\u201D""]/g,
    replace: '"',
  },
  {
    search: /[\u2018\u2019'']/g,
    replace: "'",
  },
  {
    search: /[–—]/g,
    replace: "-",
  },
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

export function htmlToEscPos(html: string): Uint8Array {
  encoder.initialize();
  const $ = cheerio.load(html);

  function processNode(node: AnyNode) {
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
          element.contents().each((_, child) => processNode(child));
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
          element.contents().each((_, child) => processNode(child));
          encoder.text(" ");
          encoder.newline();
          encoder.bold(false).align("left").invert(false);
          break;
        case "b":
        case "strong":
          encoder.bold(true);
          element.contents().each((_, child) => processNode(child));
          encoder.bold(false);
          break;
        case "i":
        case "em":
          encoder.bold(true); // Italics not supported, so using bold for emphasis.
          element.contents().each((_, child) => processNode(child));
          encoder.bold(false);
          break;
        case "u":
          encoder.underline(true);
          element.contents().each((_, child) => processNode(child));
          encoder.underline(false);
          break;
        case "a":
          encoder.underline(true);
          element.contents().each((_, child) => processNode(child));
          encoder.text(` [${element.attr("href") || ""}]`);
          encoder.underline(false);
          break;
        case "li":
          encoder.text("- ");
          element.contents().each((_, child) => processNode(child));
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
          console.warn("Image processing is not fully implemented");
          break;
        case "blockquote":
          encoder.align("right").size("small");
          element.contents().each((_, child) => processNode(child));
          encoder.align("left").size("normal");
          break;
        case "p":
          encoder.newline();
          element.contents().each((_, child) => processNode(child));
          encoder.newline();
          break;
        case "ul":
        case "ol":
          encoder.newline();
          element.contents().each((_, child) => processNode(child));
          encoder.newline();
          break;
        case "div":
        case "span":
        default:
          element.contents().each((_, child) => processNode(child));
      }
    }
  }

  $("body")
    .contents()
    .each((_, node) => processNode(node));

  return encoder.encode();
}
