import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { PrismaClient } from "@prisma/client";
import { commandsToPrintDataXML, padAndCut } from "app/lib/helpers";
import { encoder } from "app/lib/encoder";

const prisma = new PrismaClient();
const cutCommand = padAndCut(encoder.initialize()).encode();

async function markJobAsPrinted(jobId: string) {
  await prisma.printJob.update({
    where: { jobId },
    data: { printed: true },
  });
}

async function processQueue(markAsPrinted: boolean = true) {
  const jobs = await prisma.printJob.findMany({
    where: { printed: false },
    orderBy: { submitted: "asc" },
  });

  let combinedCommands = new Uint8Array();

  for (const job of jobs) {
    try {
      // Convert Buffer to Uint8Array
      const jobCommands = new Uint8Array(job.escPosCommands);

      combinedCommands = new Uint8Array([
        ...combinedCommands,
        ...jobCommands,
        ...(job.cutAfterPrint ? cutCommand : new Uint8Array()),
      ]);
      if (markAsPrinted) {
        await markJobAsPrinted(job.jobId);
        console.log(`Job ${job.jobId} processed successfully.`);
      }
    } catch (error) {
      console.error(`Error processing job ${job.jobId}:`, error);
    }
  }

  return commandsToPrintDataXML(combinedCommands);
}

async function getQueueEnabled() {
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

const connectionTypes = {
  get: "GetRequest",
  set: "SetResponse",
};

export const action: ActionFunction = async ({ request }) => {
  const bodyText = await request.text();
  const rawParams = new URLSearchParams(bodyText);
  const params: Record<string, string> = {};

  for (const [key, value] of rawParams.entries()) {
    params[key] = decodeURIComponent(value);
  }

  const { ResponseFile: responseFile, ...mainBody } = params;

  if (mainBody.ConnectionType == connectionTypes.get) {
    console.log("Request received:");
    console.log(JSON.stringify(mainBody));
    const queueEnabled = await getQueueEnabled();

    if (queueEnabled) {
      const xmlResponse = await processQueue();
      return new Response(xmlResponse, {
        status: 200,
        headers: { "Content-Type": "application/xml" },
      });
    } else {
      return json({ error: "Queue endpoint is disabled." }, { status: 403 });
    }
  } else if (mainBody.ConnectionType == connectionTypes.set) {
    console.log("Response received:");
    console.log(JSON.stringify(mainBody));

    if (responseFile) {
      console.log("Decoded ResponseFile:");
      console.log(responseFile);
    }
    return json({ success: true }, { status: 200 });
  } else {
    return json({ error: "Invalid ConnectionType." }, { status: 500 });
  }
};
