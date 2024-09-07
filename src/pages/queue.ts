import type { APIRoute } from "astro";
import { PrismaClient } from "@prisma/client";
import { commandsToPrintDataXML, padAndCut } from "@/lib/helpers";
import { encoder } from "@/lib/encoder";

const prisma = new PrismaClient();
const cutCommand = padAndCut(encoder.initialize()).encode();

async function markJobAsPrinted(jobId: string) {
  await prisma.printJob.update({
    where: { jobId },
    data: { printed: true },
  });
}

async function processQueue() {
  const jobs = await prisma.printJob.findMany({
    where: { printed: false },
    orderBy: { submitted: "asc" },
  });

  let combinedCommands = new Uint8Array();

  for (const job of jobs) {
    try {
      combinedCommands = new Uint8Array([
        ...combinedCommands,
        ...job.escPosCommands,
        ...(job.cutAfterPrint ? cutCommand : new Uint8Array()),
      ]);
      await markJobAsPrinted(job.jobId);
      console.log(`Job ${job.jobId} processed successfully.`);
    } catch (error) {
      console.error(`Error processing job ${job.jobId}:`, error);
    }
  }

  return commandsToPrintDataXML(combinedCommands);
}

async function getQueueEnabled(): Promise<boolean> {
  const currentConfig = await prisma.configuration.findFirst({
    where: {
      validTo: null,
    },
    orderBy: {
      validFrom: "desc",
    },
  });
  return currentConfig?.queueEnabled ?? false;
}

export const POST: APIRoute = async ({ request }) => {
  const bodyText = await request.text();
  const params = new URLSearchParams(bodyText);
  const decodedParams: Record<string, string> = {};

  for (const [key, value] of params.entries()) {
    decodedParams[key] = decodeURIComponent(value);
  }

  const { ResponseFile: responseFile, ...mainBody } = decodedParams;
  console.log("Request received:");
  console.log(JSON.stringify(mainBody));

  if (responseFile) {
    console.log("Decoded ResponseFile:");
    console.log(responseFile);
  }

  const queueEnabled = await getQueueEnabled();

  if (queueEnabled) {
    const xmlResponse = await processQueue();
    console.log("XML Response:");
    console.log(xmlResponse);
    return new Response(xmlResponse, {
      status: 200,
      headers: { "Content-Type": "application/xml" },
    });
  } else {
    return new Response("Queue endpoint is disabled.", { status: 403 });
  }
};
