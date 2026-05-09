import { Queue, type JobsOptions } from "bullmq";
import { getBullMqConnectionOptions } from "../config/redis";
import { defaultJobOptions } from "./queue-options";
import type { QueueName } from "./queue-names";

export const createQueue = <DataType, ResultType = unknown>(
  name: QueueName,
  defaultOptions: JobsOptions = defaultJobOptions
): Queue<DataType, ResultType> =>
  new Queue<DataType, ResultType>(name, {
    connection: getBullMqConnectionOptions(),
    defaultJobOptions: defaultOptions
  });
