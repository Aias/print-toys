"use server";

import { markdown, convertUrlsToImageMarkdown } from "@/lib/markdown";
import { htmlToEscPos } from "@/lib/html-to-esc-pos";
import { createPrintJob, printJobImmediately } from "@/api/requests";
import { fireAndForget } from "@/lib/server-actions";
import { ServerActionError } from "@/lib/errors";

export async function printMarkdownAction(markdownText: string) {
  if (!markdownText || typeof markdownText !== "string") {
    throw new ServerActionError("Invalid markdown content", "INVALID_INPUT");
  }

  const html = await markdown.parse(convertUrlsToImageMarkdown(markdownText));
  const escPosCommands = await htmlToEscPos(html);

  // Create DB record
  const job = await createPrintJob(escPosCommands);

  // Fire-and-forget print
  await fireAndForget(
    () => printJobImmediately(job.jobId, escPosCommands),
    (error) =>
      console.error(`[Markdown print failed for job ${job.jobId}]:`, error),
  );

  return { success: true, jobId: job.jobId };
}
