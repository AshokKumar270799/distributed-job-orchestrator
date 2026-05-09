import { createClient, type RedisClientType } from "redis";
import { logger } from "../utils/logger";
import { appConfig } from "./app-config";

let redisClient: RedisClientType | null = null;

export const getRedisClient = (): RedisClientType => {
  if (!redisClient) {
    redisClient = createClient({
      url: appConfig.redisUrl,
      socket: {
        reconnectStrategy: (retries) => Math.min(retries * 50, 2_000)
      }
    });

    redisClient.on("error", (error) => {
      logger.error("Redis client error", {
        message: error.message,
        name: error.name
      });
    });

    redisClient.on("reconnecting", () => {
      logger.warn("Redis client reconnecting");
    });
  }

  return redisClient;
};

export const connectRedis = async (): Promise<RedisClientType> => {
  const client = getRedisClient();

  if (!client.isOpen) {
    await client.connect();
  }

  return client;
};

export const closeRedis = async (): Promise<void> => {
  if (redisClient?.isOpen) {
    await redisClient.quit();
  }
};

export const getBullMqConnectionOptions = () => {
  const url = new URL(appConfig.redisUrl);

  return {
    host: url.hostname,
    port: Number(url.port || 6379),
    username: url.username || undefined,
    password: url.password || undefined,
    db: Number(url.pathname.replace("/", "") || 0),
    maxRetriesPerRequest: null,
    enableReadyCheck: false
  };
};
