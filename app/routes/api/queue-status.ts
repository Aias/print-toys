import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const loader: LoaderFunction = async () => {
  try {
    const currentConfig = await prisma.configuration.findFirst({
      where: { validTo: null },
      orderBy: { validFrom: "desc" },
    });

    const queueEnabled = currentConfig?.queueEnabled ?? false;

    return json({ queueEnabled });
  } catch (error) {
    console.error("Error getting queue state:", error);
    return json({ error: "Failed to get queue state." }, { status: 500 });
  }
};

export const action: ActionFunction = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const enableQueue = url.searchParams.get("enable") === "true";

    const currentConfig = await prisma.configuration.findFirst({
      where: { validTo: null },
      orderBy: { validFrom: "desc" },
    });

    if (currentConfig) {
      await prisma.configuration.update({
        where: { id: currentConfig.id },
        data: { validTo: new Date() },
      });
    }

    await prisma.configuration.create({
      data: {
        queueEnabled: enableQueue,
        validFrom: new Date(),
      },
    });

    return json({ queueEnabled: enableQueue });
  } catch (error) {
    console.error("Error setting queue state:", error);
    return json({ error: "Failed to set queue state." }, { status: 500 });
  }
};
