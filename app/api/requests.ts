import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client';
import { sendToPrinter } from '../lib/helpers';

const adapter = new PrismaPg({
  connectionString: process.env.POSTGRES_PRISMA_URL!
});

const prisma = new PrismaClient({ adapter });

export async function getQueuedJobs() {
  const jobs = await prisma.printJob.findMany({
    where: {
      printed: false
    },
    orderBy: {
      submitted: 'asc'
    }
  });
  return jobs;
}

export async function markJobAsPrinted(jobId: string) {
  await prisma.printJob.update({
    where: { jobId },
    data: { printed: true, printedAt: new Date() }
  });
}

export async function createPrintJob(escPosCommands: Uint8Array) {
  const job = await prisma.printJob.create({
    data: {
      escPosCommands: new Uint8Array(escPosCommands)
    }
  });
  return { jobId: job.jobId, escPosCommands };
}

export async function printJobImmediately(jobId: string, escPosCommands: Uint8Array) {
  try {
    await sendToPrinter(escPosCommands, false);
    await markJobAsPrinted(jobId);
    console.log(`✓ Job ${jobId} printed via USB`);
  } catch (error) {
    console.error(`✗ Failed to print job ${jobId}:`, error);
    // Job remains unprinted for manual retry
  }
}
