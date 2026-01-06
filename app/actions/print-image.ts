"use server";

import { rawDataToCanvasImage } from "@/lib/image-processing";
import { createEncoder } from "@/lib/encoder";
import { createPrintJob, printJobImmediately } from "@/api/requests";
import { fireAndForget, ServerActionError } from "@/lib/server-actions";

export async function printImageAction(formData: FormData) {
  const imageData = formData.get("image") as File | null;

  if (!imageData) {
    throw new ServerActionError("No image provided", "NO_IMAGE");
  }

  const buffer = Buffer.from(await imageData.arrayBuffer());
  const { canvas, width, height } = await rawDataToCanvasImage(buffer);

  const encoder = createEncoder();
  encoder.image(canvas, width, height, "atkinson");

  const escPosCommands = encoder.cut().encode();

  // Create DB record
  const job = await createPrintJob(escPosCommands);

  // Fire-and-forget print
  await fireAndForget(
    () => printJobImmediately(job.jobId, escPosCommands),
    (error) =>
      console.error(`[Image print failed for job ${job.jobId}]:`, error),
  );

  return { success: true, jobId: job.jobId };
}
