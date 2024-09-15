import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useFetcher,
} from "@remix-run/react";
import { json, type LoaderFunction } from "@remix-run/node";
import { Navigation } from "~/components/Navigation";
import { getQueueEnabled } from "~/api/requests";
import "./tailwind.css";
import { useCallback, useEffect, useState } from "react";

interface QueueStatusData {
  queueEnabled: boolean;
  error?: string;
}

export const loader: LoaderFunction = async () => {
  try {
    const queueEnabled = await getQueueEnabled();
    return json<QueueStatusData>({ queueEnabled });
  } catch (error) {
    console.error("Error getting queue state:", error);
    return json<QueueStatusData>(
      { queueEnabled: false, error: "Failed to get queue state." },
      { status: 500 }
    );
  }
};

export function Layout({ children }: { children: React.ReactNode }) {
  const loaderData = useLoaderData<QueueStatusData>();
  const initialQueueEnabled = loaderData?.queueEnabled ?? false;
  const [queueEnabled, setQueueEnabled] = useState(initialQueueEnabled);
  const fetcher = useFetcher<QueueStatusData>();

  useEffect(() => {
    if (fetcher.data) {
      setQueueEnabled(fetcher.data.queueEnabled);
    }
  }, [fetcher.data]);

  const toggleQueue = useCallback(
    (enable: boolean) => {
      fetcher.submit(
        { enable: enable.toString() },
        { method: "post", action: "/actions/set-queue-status" }
      );
    },
    [fetcher]
  );

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="min-h-screen font-sans">
        <header className="bg-muted p-4 border border-b">
          <Navigation queueEnabled={queueEnabled} toggleQueue={toggleQueue} />
        </header>
        <main className="flex-1">{children}</main>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
