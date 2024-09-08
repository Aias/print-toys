import { useState, useEffect } from "react";
import {
  json,
  type LoaderFunction,
  type ActionFunction,
} from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface QueueStatusResponse {
  queueEnabled: boolean;
}

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
    const formData = await request.formData();
    const enableQueue = formData.get("enable") === "true";

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

export default function Admin() {
  const loaderData = useLoaderData<typeof loader>();
  const [queueEnabled, setQueueEnabled] = useState(loaderData.queueEnabled);
  const fetcher = useFetcher<QueueStatusResponse>();

  useEffect(() => {
    if (fetcher.data) {
      setQueueEnabled(fetcher.data.queueEnabled);
    }
  }, [fetcher.data]);

  const toggleQueue = (enable: boolean) => {
    fetcher.submit({ enable: enable.toString() }, { method: "post" });
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Print Queue Admin</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Current queue status: {queueEnabled ? "Enabled" : "Disabled"}
          </p>
          <div className="flex space-x-4">
            <Button onClick={() => toggleQueue(true)} disabled={queueEnabled}>
              Enable Queue
            </Button>
            <Button onClick={() => toggleQueue(false)} disabled={!queueEnabled}>
              Disable Queue
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
