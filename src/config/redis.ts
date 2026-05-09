import { createClient, type RedisClientType } from "redis";
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
      console.error("Redis client error", {
        message: error.message,
        name: error.name
      });
    });

    redisClient.on("reconnecting", () => {
      console.warn("Redis client reconnecting");
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

export const redisConnectionOptions = {
  url: appConfig.redisUrl
} as const;
