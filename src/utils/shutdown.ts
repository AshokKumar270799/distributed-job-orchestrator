import { logger } from "./logger";

export type ShutdownHandler = () => Promise<void>;

export const registerGracefulShutdown = (
  componentName: string,
  handlers: ShutdownHandler[]
): void => {
  let shuttingDown = false;

  const shutdown = async (signal: NodeJS.Signals): Promise<void> => {
    if (shuttingDown) {
      return;
    }

    shuttingDown = true;
    logger.info("Graceful shutdown started", { component: componentName, signal });

    try {
      await Promise.allSettled(handlers.map((handler) => handler()));
      logger.info("Graceful shutdown completed", { component: componentName });
      process.exit(0);
    } catch (error) {
      logger.error("Graceful shutdown failed", {
        component: componentName,
        error: error instanceof Error ? error.message : String(error)
      });
      process.exit(1);
    }
  };

  process.on("SIGINT", (signal) => {
    void shutdown(signal);
  });

  process.on("SIGTERM", (signal) => {
    void shutdown(signal);
  });
};
