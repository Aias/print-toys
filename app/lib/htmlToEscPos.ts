import { encoder } from "./encoder";
import { JSDOM } from "jsdom";

export function htmlToEscPos(html: string): Uint8Array {
  encoder.initialize();
  const dom = new JSDOM(html);
  const document = dom.window.document;

  function processNode(node: Node) {
    if (node.nodeType === Node.TEXT_NODE) {
      encoder.text(node.textContent || "");
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      switch (element.tagName.toLowerCase()) {
        case "b":
        case "strong":
          encoder.bold(true);
          element.childNodes.forEach(processNode);
          encoder.bold(false);
          break;
        case "i":
        case "em":
          encoder.italic(true);
          element.childNodes.forEach(processNode);
          encoder.italic(false);
          break;
        case "u":
          encoder.underline(true);
          element.childNodes.forEach(processNode);
          encoder.underline(false);
          break;
        case "h1":
        case "h2":
        case "h3":
        case "h4":
        case "h5":
        case "h6":
          encoder.bold(true).size("normal");
          element.childNodes.forEach(processNode);
          encoder.bold(false).size("small").newline();
          break;
        case "p":
          element.childNodes.forEach(processNode);
          encoder.newline().newline();
          break;
        case "br":
          encoder.newline();
          break;
        case "hr":
          encoder.rule({ style: "single" });
          break;
        case "img":
          // Note: Image processing requires additional setup and is not fully implemented here
          console.warn("Image processing is not fully implemented");
          break;
        case "div":
        case "span":
          element.childNodes.forEach(processNode);
          break;
        default:
          element.childNodes.forEach(processNode);
      }
    }
  }

  processNode(document.body);

  return encoder.encode();
}
