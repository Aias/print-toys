import type { ActionFunction } from "@remix-run/cloudflare";
import {
  commandsToPrintDataXML,
  padAndCut,
  parsePrinterResponse,
} from "app/lib/helpers";
import { encoder } from "app/lib/encoder";
import {
  getQueueEnabled,
  getQueuedJobs,
  markJobAsPrinted,
  savePrinterResponse,
} from "app/api/requests";

const cutCommand = padAndCut(encoder.initialize()).encode();

async function processQueue(env: Env, markAsPrinted: boolean = true) {
  const jobs = await getQueuedJobs(env);

  if (jobs.length === 0) {
    return null;
  }

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
        await markJobAsPrinted(env, job.jobId);
        console.log(`Job ${job.jobId} processed successfully.`);
      }
    } catch (error) {
      console.error(`Error processing job ${job.jobId}:`, error);
    }
  }

  return commandsToPrintDataXML(combinedCommands);
}

const GET_REQUEST = "GetRequest" as const;
const SET_RESPONSE = "SetResponse" as const;

const nullResponse = new Response(null, {
  status: 200,
  headers: {
    "Content-Type": "text/xml; charset=utf-8",
    "Content-Length": "0",
  },
});

export const action: ActionFunction = async ({ request, context }) => {
  const bodyText = await request.text();
  const rawParams = new URLSearchParams(bodyText);
  const params: Record<string, string> = {};

  for (const [key, value] of rawParams.entries()) {
    params[key] = decodeURIComponent(value);
  }

  const { ResponseFile: responseFile, ...mainBody } = params;

  if (mainBody.ConnectionType == GET_REQUEST) {
    const queueEnabled = await getQueueEnabled(context.cloudflare.env);

    if (queueEnabled) {
      const xmlResponse = await processQueue(context.cloudflare.env);
      if (xmlResponse) {
        // There are print jobs available
        return new Response(xmlResponse, {
          status: 200,
          headers: { "Content-Type": "text/xml; charset=utf-8" },
        });
      } else {
        // No print jobs available
        return nullResponse;
      }
    } else {
      // Queue is disabled
      return nullResponse;
    }
  } else if (mainBody.ConnectionType == SET_RESPONSE) {
    console.log("Job response received.");

    if (responseFile) {
      try {
        const parsedResponse = await parsePrinterResponse(responseFile);
        await savePrinterResponse(context.cloudflare.env, parsedResponse);
        console.log("Response saved successfully.");
      } catch (error) {
        console.error("Error processing printer response:", error);
      }
    }
    return nullResponse;
  } else {
    // Invalid ConnectionType
    console.error("Invalid ConnectionType:", mainBody.ConnectionType);
    return nullResponse;
  }
};

export default action;
