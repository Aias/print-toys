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

      expect(containsIndentedLine(bytes, "    hello")).toBe(true);
      expect(containsIndentedLine(bytes, "        indented")).toBe(true);
    });

    test("preserves multiple indent levels", async () => {
      const md = "```\nroot\n  two\n    four\n      six\n```";
      const html = await markdown.parse(md);
      const bytes = await htmlToEscPos(html);

      expect(containsIndentedLine(bytes, "root")).toBe(true);
      expect(containsIndentedLine(bytes, "  two")).toBe(true);
      expect(containsIndentedLine(bytes, "    four")).toBe(true);
      expect(containsIndentedLine(bytes, "      six")).toBe(true);
    });

    test("preserves ASCII art characters", async () => {
      const art = "  /\\\n / \\\n/____\\";
      const md = "```\n" + art + "\n```";
      const html = await markdown.parse(md);
      const bytes = await htmlToEscPos(html);

      expect(containsIndentedLine(bytes, "  /\\")).toBe(true);
      expect(containsIndentedLine(bytes, " / \\")).toBe(true);
      expect(containsIndentedLine(bytes, "/____\\")).toBe(true);
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

    test("encodes non-ASCII using printer codepage bytes", async () => {
      const md = "```\ncafe é\n```";
      const html = await markdown.parse(md);
      const bytes = await htmlToEscPos(html);

      expect(Array.from(bytes).some((byte) => byte > 0x7f)).toBe(true);
      expect(containsEscSequence(bytes, [0xc3, 0xa9])).toBe(false);
    });

    test("resets line spacing after writing code block content", async () => {
      const md = "```\nline1\nline2\n```";
      const html = await markdown.parse(md);
      const bytes = await htmlToEscPos(html);

      const setLineSpacingIndex = findSequenceIndex(bytes, [0x1b, 0x33, 20]);
      const line2Index = findSequenceIndex(
        bytes,
        Array.from(new TextEncoder().encode("line2")),
      );
      const resetLineSpacingIndex = findSequenceIndex(
        bytes,
        [0x1b, 0x32],
        setLineSpacingIndex + 1,
      );

      expect(setLineSpacingIndex).toBeGreaterThanOrEqual(0);
      expect(line2Index).toBeGreaterThan(setLineSpacingIndex);
      expect(resetLineSpacingIndex).toBeGreaterThan(line2Index);
    });
  });
});

/** Search for an exact byte sequence inside a Uint8Array. */
function containsEscSequence(bytes: Uint8Array, seq: number[]): boolean {
  return findSequenceIndex(bytes, seq) >= 0;
}

function containsIndentedLine(bytes: Uint8Array, line: string): boolean {
  const leadingSpaces = line.match(/^ +/)?.[0].length ?? 0;
  if (leadingSpaces === 0) {
    return containsAscii(bytes, line);
  }

  const text = line.slice(leadingSpaces);
  const spaceBytes = new Array(leadingSpaces).fill(0x20);
  const textBytes = new TextEncoder().encode(text);

  outer: for (let i = 0; i <= bytes.length - spaceBytes.length; i++) {
    for (let j = 0; j < spaceBytes.length; j++) {
      if (bytes[i + j] !== spaceBytes[j]) continue outer;
    }

    let textStart = i + spaceBytes.length;
    while (
      textStart + 2 < bytes.length &&
      bytes[textStart] === 0x1b &&
      bytes[textStart + 1] === 0x74
    ) {
      textStart += 3;
    }

    let matches = true;
    for (let j = 0; j < textBytes.length; j++) {
      if (bytes[textStart + j] !== textBytes[j]) {
        matches = false;
        break;
      }
    }
    if (matches) return true;
  }

  return false;
}

function findSequenceIndex(
  bytes: Uint8Array,
  seq: number[],
  fromIndex = 0,
): number {
  outer: for (let i = 0; i <= bytes.length - seq.length; i++) {
    if (i < fromIndex) continue;
    for (let j = 0; j < seq.length; j++) {
      if (bytes[i + j] !== seq[j]) continue outer;
    }
    return i;
  }
  return -1;
}
