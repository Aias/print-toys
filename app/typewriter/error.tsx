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
    console.error("[Typewriter error]:", error);
  }, [error]);

  return (
    <div className="p-4">
      <h2 className="mb-4 text-xl font-bold text-red-600">Print Error</h2>
      <p className="mb-4">
        Failed to print. The printer may be unavailable or disconnected.
      </p>
      <Button onClick={reset}>Try Again</Button>
    </div>
  );
}
