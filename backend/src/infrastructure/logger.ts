export const logger = {
  info(message: string, meta?: Record<string, unknown>): void {
    const payload = {
      level: 'info',
      timestamp: new Date().toISOString(),
      message,
      ...(meta ? { meta } : {}),
    };
    console.info(JSON.stringify(payload));
  },

  error(message: string, error?: unknown): void {
    const errorMessage =
      error instanceof Error ? error.message : String(error ?? '');
    const payload = {
      level: 'error',
      timestamp: new Date().toISOString(),
      message,
      error: errorMessage,
    };
    console.error(JSON.stringify(payload));
  },
};

