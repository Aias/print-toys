#!/usr/bin/env tsx
/**
 * USB Queue Recovery Tool
 *
 * As of the event-driven architecture migration, print jobs are sent to the USB
 * printer immediately when submitted via the web UI. This script is now primarily
 * used as a recovery tool for jobs that failed to print or were stuck in the queue.
 *
 * Use cases:
 * - Retry failed print jobs after USB connection was lost
 * - Print jobs that were queued before the event-driven system was implemented
 * - Manual batch processing of pending jobs
 *
 * Run with: npx tsx process-usb-queue.ts [--watch]
 *
 * --watch mode: Continuously poll for new jobs every 5 seconds (useful for testing)
 */

import "dotenv/config";
import { getQueuedJobs, markJobAsPrinted } from "./app/api/requests";
import { sendToPrinter } from "./app/lib/helpers";

async function processQueue() {
  console.log("Checking for queued jobs...");

  const jobs = await getQueuedJobs();

  if (jobs.length === 0) {
    console.log("No jobs in queue");
    return;
  }

  console.log(`Found ${jobs.length} job(s) to print`);

  for (const job of jobs) {
    try {
      const jobCommands = new Uint8Array(job.escPosCommands);

      console.log(`Printing job ${job.jobId} (${jobCommands.length} bytes)...`);
      await sendToPrinter(jobCommands, false);

      await markJobAsPrinted(job.jobId);
      console.log(`✓ Job ${job.jobId} printed successfully`);
    } catch (error) {
      console.error(`✗ Error printing job ${job.jobId}:`, error);
    }
  }
}

// Check if --watch flag is provided
const watchMode = process.argv.includes("--watch");

if (watchMode) {
  console.log("Starting queue processor in watch mode (polling every 5s)...");
  console.log("Press Ctrl+C to stop\n");

  // Process immediately, then poll every 5 seconds
  processQueue();
  setInterval(processQueue, 5000);
} else {
  // Single run mode
  processQueue()
    .then(() => {
      console.log("\nDone");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Fatal error:", error);
      process.exit(1);
    });
}
