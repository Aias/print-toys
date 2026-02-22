// Generic error class for Server Actions
export class ServerActionError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'ServerActionError';
  }
}
