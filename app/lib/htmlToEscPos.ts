import { encoder } from "./encoder";
import { JSDOM } from "jsdom";

export function htmlToEscPos(html: string): Uint8Array {
  encoder.initialize();
  const dom = new JSDOM(html);
  const document = dom.window.document;

  function processNode(node: Node) {
    if (node.nodeType === dom.window.Node.TEXT_NODE) {
      const textContent = node.textContent || "";
      const visibleWhitespace = textContent.replace(/\s/g, (match) => {
        switch (match) {
          // Strip extra newlines from text.
          case "\n":
            return "";
          case "\r":
            return "";
          default:
            return match;
        }
      });
      encoder.text(visibleWhitespace);
    } else if (node.nodeType === dom.window.Node.ELEMENT_NODE) {
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
        case "a":
          encoder.underline(true);
          element.childNodes.forEach(processNode);
          encoder.text(` [${element.getAttribute("href") || ""}]`);
          encoder.underline(false);
          break;
        case "h1":
          encoder.bold(true).height(2).width(2);
          element.childNodes.forEach(processNode);
          encoder.bold(false).height(1).width(1);
          encoder.newline().newline();
          break;
        case "h2":
        case "h3":
        case "h4":
        case "h5":
        case "h6":
          encoder.bold(true);
          encoder.text(element.textContent?.toUpperCase() || "");
          encoder.bold(false);
          encoder.newline();
          break;
        case "p":
          element.childNodes.forEach(processNode);
          encoder.newline().newline();
          break;
        case "ul":
        case "ol":
          element.childNodes.forEach(processNode);
          encoder.newline();
          break;
        case "br":
          encoder.newline();
          break;
        case "li":
          encoder.text("- ");
          element.childNodes.forEach(processNode);
          encoder.newline();
          break;
        case "hr":
          encoder.rule({ style: "single" });
          break;
        case "img":
          console.warn("Image processing is not fully implemented");
          break;
        case "blockquote":
          encoder.invert(true);
          element.childNodes.forEach(processNode);
          encoder.invert(false);
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
