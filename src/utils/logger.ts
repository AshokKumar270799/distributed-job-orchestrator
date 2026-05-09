type LogLevel = "debug" | "info" | "warn" | "error";

type LogContext = Record<string, unknown>;

const writeLog = (level: LogLevel, message: string, context: LogContext = {}): void => {
  const entry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...context
  };

  const serialized = JSON.stringify(entry);

  if (level === "error") {
    console.error(serialized);
    return;
  }

  if (level === "warn") {
    console.warn(serialized);
    return;
  }

  console.log(serialized);
};

export const logger = {
  debug: (message: string, context?: LogContext) => writeLog("debug", message, context),
  info: (message: string, context?: LogContext) => writeLog("info", message, context),
  warn: (message: string, context?: LogContext) => writeLog("warn", message, context),
  error: (message: string, context?: LogContext) => writeLog("error", message, context)
};
