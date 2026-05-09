import { QueueEvents } from "bullmq";
import { getBullMqConnectionOptions } from "../config/redis";
import type { QueueName } from "./queue-names";

export const createQueueEvents = (queueName: QueueName): QueueEvents => {
  const events = new QueueEvents(queueName, {
    connection: getBullMqConnectionOptions()
  });

  events.on("completed", ({ jobId }) => {
    console.log("Queue job completed", { queue: queueName, jobId });
  });

  events.on("failed", ({ jobId, failedReason }) => {
    console.error("Queue job failed", { queue: queueName, jobId, failedReason });
  });

  events.on("stalled", ({ jobId }) => {
    console.warn("Queue job stalled", { queue: queueName, jobId });
  });

  events.on("error", (error) => {
    console.error("Queue events error", {
      queue: queueName,
      message: error.message,
      name: error.name
    });
  });

  return events;
};
