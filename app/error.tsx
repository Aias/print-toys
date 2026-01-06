"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[App error]:", error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="p-4">
          <h1 className="mb-4 text-2xl font-bold text-red-600">
            Application Error
          </h1>
          <p className="mb-4">Something went wrong. Please try again.</p>
          <Button onClick={reset}>Reload</Button>
        </div>
      </body>
    </html>
  );
}
