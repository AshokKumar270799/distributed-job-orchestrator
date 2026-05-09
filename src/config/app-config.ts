import dotenv from "dotenv";

dotenv.config();

const toNumber = (value: string | undefined, fallback: number): number => {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const appConfig = {
  env: process.env.NODE_ENV ?? "development",
  port: toNumber(process.env.PORT, 3000),
  redisUrl: process.env.REDIS_URL ?? "redis://127.0.0.1:6379",
  serviceName: process.env.SERVICE_NAME ?? "distributed-job-queue-system"
} as const;
