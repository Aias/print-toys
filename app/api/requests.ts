import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getCurrentConfiguration() {
  const currentConfig = await prisma.configuration.findFirst({
    where: {
      validTo: null,
    },
    orderBy: {
      validFrom: "desc",
    },
  });
  return currentConfig;
}

export async function getQueueEnabled() {
  const currentConfig = await getCurrentConfiguration();
  return currentConfig?.queueEnabled ?? false;
}

export async function setQueueEnabled(enabled: boolean) {
  const currentConfig = await getCurrentConfiguration();
  if (currentConfig) {
    await prisma.configuration.update({
      where: { id: currentConfig.id },
      data: { validTo: new Date(), queueEnabled: enabled },
    });
  }
  await prisma.configuration.create({
    data: {
      queueEnabled: enabled,
      validFrom: new Date(),
    },
  });
}

export async function getQueuedJobs() {
  const jobs = await prisma.printJob.findMany({
    where: {
      printed: false,
    },
    orderBy: {
      submitted: "asc",
    },
  });
  return jobs;
}

export async function markJobAsPrinted(jobId: string) {
  await prisma.printJob.update({
    where: { jobId },
    data: { printed: true },
  });
}

export async function createPrintJob(
  escPosCommands: Buffer,
  cutAfterPrint?: boolean
) {
  await prisma.printJob.create({
    data: {
      escPosCommands,
      cutAfterPrint,
    },
  });
}
