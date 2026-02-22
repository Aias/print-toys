import { after } from 'next/server';

// Wrapper for fire-and-forget operations using after() API
export function fireAndForget<T>(
  operation: () => Promise<T>,
  errorHandler?: (error: Error) => void
): void {
  after(async () => {
    try {
      await operation();
    } catch (error) {
      if (errorHandler) {
        errorHandler(error as Error);
      } else {
        console.error('[Fire-and-forget error]:', error);
      }
    }
  });
}
