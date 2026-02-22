import { NextResponse } from "next/server";
import { createEncoder } from "@/lib/encoder";
import { markdown, convertUrlsToImageMarkdown } from "@/lib/markdown";
import { htmlToEscPos } from "@/lib/html-to-esc-pos";
import { createPrintJob, printJobImmediately } from "@/api/requests";
import { fireAndForget } from "@/lib/server-actions";
/**
 * Encoder methods exposed via the API.
 * Each maps 1:1 to a ReceiptPrinterEncoder method.
 */
const allowedMethods = new Set([
  "text",
  "newline",
  "line",
  "underline",
  "italic",
  "bold",
  "invert",
  "width",
  "height",
  "size",
  "font",
  "align",
  "table",
  "rule",
  "box",
  "barcode",
  "qrcode",
  "pdf417",
  "cut",
  "pulse",
  "raw",
]);

type MarkdownCommand = { type: "markdown"; content: string };
type EncoderCommand = [string, ...unknown[]];
type PrintCommand = MarkdownCommand | EncoderCommand;

function isMarkdownCommand(cmd: unknown): cmd is MarkdownCommand {
  return (
    typeof cmd === "object" &&
    cmd !== null &&
    !Array.isArray(cmd) &&
    (cmd as Record<string, unknown>).type === "markdown" &&
    typeof (cmd as Record<string, unknown>).content === "string" &&
    ((cmd as Record<string, unknown>).content as string).length > 0
  );
}

function isEncoderCommand(cmd: unknown): cmd is EncoderCommand {
  return (
    Array.isArray(cmd) &&
    cmd.length >= 1 &&
    typeof cmd[0] === "string" &&
    allowedMethods.has(cmd[0])
  );
}

function isPrintCommand(cmd: unknown): cmd is PrintCommand {
  return isMarkdownCommand(cmd) || isEncoderCommand(cmd);
}

function parseBody(body: unknown): PrintCommand[] | null {
  // Single markdown object
  if (isMarkdownCommand(body)) return [body];
  // Single encoder command
  if (isEncoderCommand(body)) return [body];
  // Array of commands
  if (Array.isArray(body) && body.length > 0 && body.every(isPrintCommand))
    return body;
  return null;
}

function applyEncoderCommand(
  encoder: ReturnType<typeof createEncoder>,
  [method, ...args]: EncoderCommand,
) {
  const fn = encoder[method as keyof typeof encoder];
  if (typeof fn === "function") {
    (fn as (...a: unknown[]) => unknown).apply(encoder, args);
  }
}

function concat(arrays: Uint8Array[]): Uint8Array {
  const length = arrays.reduce((sum, a) => sum + a.length, 0);
  const result = new Uint8Array(length);
  let offset = 0;
  for (const a of arrays) {
    result.set(a, offset);
    offset += a.length;
  }
  return result;
}

async function processCommands(commands: PrintCommand[]): Promise<Uint8Array> {
  const chunks: Uint8Array[] = [];
  let encoder = createEncoder();

  for (const cmd of commands) {
    if (isMarkdownCommand(cmd)) {
      // Flush current encoder state
      chunks.push(encoder.encode());
      // Process markdown with its own encoder
      const html = await markdown.parse(
        convertUrlsToImageMarkdown(cmd.content),
      );
      chunks.push(await htmlToEscPos(html));
      // Fresh encoder for subsequent commands
      encoder = createEncoder();
    } else {
      applyEncoderCommand(encoder, cmd);
    }
  }

  // Flush remaining encoder state
  chunks.push(encoder.encode());
  return concat(chunks);
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const commands = parseBody(body);
  if (!commands) {
    return NextResponse.json(
      {
        error:
          'Invalid request. Expected a command or array of commands. Markdown: { type: "markdown", content: string }. Encoder: ["method", ...args] where method is one of: ' +
          [...allowedMethods].join(", "),
      },
      { status: 400 },
    );
  }

  // Auto-append cut if not already present
  const last = commands[commands.length - 1];
  if (!isEncoderCommand(last) || last[0] !== "cut") {
    commands.push(["cut"]);
  }

  try {
    const escPosCommands = await processCommands(commands);
    const job = await createPrintJob(escPosCommands);

    await fireAndForget(
      () => printJobImmediately(job.jobId, escPosCommands),
      (error) =>
        console.error(`[API print failed for job ${job.jobId}]:`, error),
    );

    return NextResponse.json({ success: true, jobId: job.jobId });
  } catch (error) {
    console.error("[API /api/print error]:", error);
    return NextResponse.json(
      { error: "Failed to process print job" },
      { status: 500 },
    );
  }
}
