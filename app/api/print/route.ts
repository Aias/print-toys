import { NextResponse } from "next/server";
import { encoder } from "@/lib/encoder";
import { markdown, convertUrlsToImageMarkdown } from "@/lib/markdown";
import { htmlToEscPos, commonReplacements } from "@/lib/html-to-esc-pos";
import { createPrintJob, printJobImmediately } from "@/api/requests";
import { fireAndForget } from "@/lib/server-actions";

type PrintRequest =
  | { type: "markdown"; content: string }
  | { type: "text"; content: string }
  | { type: "cut" };

function isPrintRequest(body: unknown): body is PrintRequest {
  if (typeof body !== "object" || body === null) return false;
  const obj = body as Record<string, unknown>;

  if (obj.type === "cut") return true;
  if (
    (obj.type === "markdown" || obj.type === "text") &&
    typeof obj.content === "string" &&
    obj.content.length > 0
  )
    return true;

  return false;
}

async function generateEscPos(request: PrintRequest): Promise<Uint8Array> {
  switch (request.type) {
    case "markdown": {
      const html = await markdown.parse(
        convertUrlsToImageMarkdown(request.content),
      );
      return htmlToEscPos(html);
    }
    case "text": {
      let line = request.content;
      for (const { search, replace } of commonReplacements) {
        line = line.replace(search, replace);
      }
      return encoder.initialize().line(line).encode();
    }
    case "cut":
      return encoder.initialize().cut().encode();
  }
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

  if (!isPrintRequest(body)) {
    return NextResponse.json(
      { error: 'Invalid request. Expected { type: "markdown"|"text"|"cut", content?: string }' },
      { status: 400 },
    );
  }

  try {
    const escPosCommands = await generateEscPos(body);
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
