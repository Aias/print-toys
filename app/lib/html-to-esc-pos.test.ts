import { describe, expect, test } from "vitest";
import { htmlToEscPos } from "./html-to-esc-pos";
import { markdown } from "./markdown";

/** Search for an ASCII string inside a Uint8Array of ESC/POS bytes. */
function containsAscii(bytes: Uint8Array, needle: string): boolean {
  const encoded = new TextEncoder().encode(needle);
  outer: for (let i = 0; i <= bytes.length - encoded.length; i++) {
    for (let j = 0; j < encoded.length; j++) {
      if (bytes[i + j] !== encoded[j]) continue outer;
    }
    return true;
  }
  return false;
}

describe("htmlToEscPos", () => {
  describe("pre (fenced code blocks)", () => {
    test("preserves leading whitespace", async () => {
      const md = "```\n    hello\n        indented\n```";
      const html = await markdown.parse(md);
      const bytes = await htmlToEscPos(html);

      expect(containsAscii(bytes, "    hello")).toBe(true);
      expect(containsAscii(bytes, "        indented")).toBe(true);
    });

    test("preserves multiple indent levels", async () => {
      const md = "```\nroot\n  two\n    four\n      six\n```";
      const html = await markdown.parse(md);
      const bytes = await htmlToEscPos(html);

      expect(containsAscii(bytes, "root")).toBe(true);
      expect(containsAscii(bytes, "  two")).toBe(true);
      expect(containsAscii(bytes, "    four")).toBe(true);
      expect(containsAscii(bytes, "      six")).toBe(true);
    });

    test("preserves ASCII art characters", async () => {
      const art = "  /\\\n / \\\n/____\\";
      const md = "```\n" + art + "\n```";
      const html = await markdown.parse(md);
      const bytes = await htmlToEscPos(html);

      expect(containsAscii(bytes, "  /\\")).toBe(true);
      expect(containsAscii(bytes, " / \\")).toBe(true);
      expect(containsAscii(bytes, "/____\\")).toBe(true);
    });

    test("sets Font B (ESC ! 0x01) for code blocks", async () => {
      const md = "```\nhello\n```";
      const html = await markdown.parse(md);
      const bytes = await htmlToEscPos(html);

      // ESC M 1 = select Font B
      const hasFontB = containsEscSequence(bytes, [0x1b, 0x4d, 0x01]);
      expect(hasFontB).toBe(true);
    });

    test("sets tight line spacing (ESC 3 20)", async () => {
      const md = "```\nline1\nline2\n```";
      const html = await markdown.parse(md);
      const bytes = await htmlToEscPos(html);

      expect(containsEscSequence(bytes, [0x1b, 0x33, 20])).toBe(true);
      // Resets line spacing after: ESC 2
      expect(containsEscSequence(bytes, [0x1b, 0x32])).toBe(true);
    });
  });
});

/** Search for an exact byte sequence inside a Uint8Array. */
function containsEscSequence(bytes: Uint8Array, seq: number[]): boolean {
  outer: for (let i = 0; i <= bytes.length - seq.length; i++) {
    for (let j = 0; j < seq.length; j++) {
      if (bytes[i + j] !== seq[j]) continue outer;
    }
    return true;
  }
  return false;
}
