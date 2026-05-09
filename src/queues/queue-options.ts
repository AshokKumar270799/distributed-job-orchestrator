import type { JobsOptions } from "bullmq";

export const defaultJobOptions: JobsOptions = {
  attempts: 1,
  removeOnComplete: {
    age: 60 * 60,
    count: 1_000
  },
  removeOnFail: false
};
