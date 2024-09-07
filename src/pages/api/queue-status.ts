import type { APIRoute } from "astro";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const GET: APIRoute = async () => {
  try {
    const currentConfig = await prisma.configuration.findFirst({
      where: { validTo: null },
      orderBy: { validFrom: "desc" },
    });

    const queueEnabled = currentConfig?.queueEnabled ?? false;

    return new Response(JSON.stringify({ queueEnabled }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error getting queue state:", error);
    return new Response(
      JSON.stringify({ error: "Failed to get queue state." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

export const POST: APIRoute = async ({ request }) => {
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

    return new Response(JSON.stringify({ queueEnabled: enableQueue }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error setting queue state:", error);
    return new Response(
      JSON.stringify({ error: "Failed to set queue state." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
