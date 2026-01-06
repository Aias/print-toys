"use server";

import { after } from "next/server";

// Wrapper for fire-and-forget operations using after() API
export async function fireAndForget<T>(
  operation: () => Promise<T>,
  errorHandler?: (error: Error) => void,
): Promise<void> {
  after(async () => {
    try {
      await operation();
    } catch (error) {
      if (errorHandler) {
        errorHandler(error as Error);
      } else {
        console.error("[Fire-and-forget error]:", error);
      }
    }
  });
}

// Generic error class for Server Actions
export class ServerActionError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ServerActionError";
  }
}
