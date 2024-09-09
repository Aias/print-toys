import { PrismaClient } from "@prisma/client";
import { PrismaD1 } from "@prisma/adapter-d1";

const getPrismaClient = (env: Env) => {
  const adapter = new PrismaD1(env.DB);
  return new PrismaClient({ adapter });
};

export async function getCurrentConfiguration(env: Env) {
  const prisma = getPrismaClient(env);
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

export async function getQueueEnabled(env: Env) {
  const currentConfig = await getCurrentConfiguration(env);
  return currentConfig?.queueEnabled ?? false;
}

export async function setQueueEnabled(env: Env, enabled: boolean) {
  const currentConfig = await getCurrentConfiguration(env);
  const prisma = getPrismaClient(env);
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

export async function getQueuedJobs(env: Env) {
  const prisma = getPrismaClient(env);
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

export async function markJobAsPrinted(env: Env, jobId: string) {
  const prisma = getPrismaClient(env);
  await prisma.printJob.update({
    where: { jobId },
    data: { printed: true },
  });
}

export async function createPrintJob(
  env: Env,
  escPosCommands: Buffer,
  cutAfterPrint?: boolean
) {
  const prisma = getPrismaClient(env);
  await prisma.printJob.create({
    data: {
      escPosCommands,
      cutAfterPrint,
    },
  });
}

export async function savePrinterResponse(
  env: Env,
  response: {
    serverDirectPrintSuccess: boolean;
    serverDirectPrintErrorSummary?: string;
    serverDirectPrintErrorDetail?: string;
    printerDeviceId?: string;
    printerJobId?: string;
    printerSuccess: boolean;
    printerCode?: string;
    printerStatus?: string;
    fullXml: string; // Add this line
  }
) {
  const prisma = getPrismaClient(env);
  await prisma.printJobResult.create({
    data: response,
  });
}
