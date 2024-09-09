import { encoder } from "./encoder";
import { JSDOM } from "jsdom";

const commonReplacements = [
  {
    search: /[""]/g,
    replace: '"',
  },
  {
    search: /['']/g,
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
  const dom = new JSDOM(html);
  const document = dom.window.document;

  function processNode(node: Node) {
    if (node.nodeType === dom.window.Node.TEXT_NODE) {
      let textContent = node.textContent || "";

      // Apply common replacements
      commonReplacements.forEach(({ search, replace }) => {
        textContent = textContent.replace(search, replace);
      });

      encoder.text(textContent);
    } else if (node.nodeType === dom.window.Node.ELEMENT_NODE) {
      const element = node as Element;
      switch (element.tagName.toLowerCase()) {
        case "h1":
          encoder.bold(true).height(2).width(2);
          element.childNodes.forEach(processNode);
          encoder.bold(false).height(1).width(1);
          encoder.newline();
          break;
        case "h2":
          encoder.bold(true);
          encoder.rule({ style: "double" });
          encoder.newline();
          encoder.text(element.textContent?.toUpperCase() || "");
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
          element.childNodes.forEach(processNode);
          encoder.text(" ");
          encoder.newline();
          encoder.bold(false).align("left").invert(false);
          break;
        case "b":
        case "strong":
          encoder.bold(true);
          element.childNodes.forEach(processNode);
          encoder.bold(false);
          break;
        case "i":
        case "em":
          // encoder.italic(true)
          encoder.bold(true); // Italics not supported, so using bold for emphasis.
          element.childNodes.forEach(processNode);
          // encoder.italic(false);
          encoder.bold(false);
          break;
        case "u":
          encoder.underline(true);
          element.childNodes.forEach(processNode);
          encoder.underline(false);
          break;
        case "a":
          encoder.underline(true);
          element.childNodes.forEach(processNode);
          encoder.text(` [${element.getAttribute("href") || ""}]`);
          encoder.underline(false);
          break;
        case "li":
          encoder.text("- ");
          element.childNodes.forEach(processNode);
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
          element.childNodes.forEach(processNode);
          encoder.align("left").size("normal");
          break;
        case "p":
          encoder.newline();
          element.childNodes.forEach(processNode);
          encoder.newline();
          break;
        case "ul":
        case "ol":
          encoder.newline();
          element.childNodes.forEach(processNode);
          encoder.newline();
          break;
        case "div":
        case "span":
        default:
          element.childNodes.forEach(processNode);
      }
    }
  }

  processNode(document.body);

  return encoder.encode();
}
