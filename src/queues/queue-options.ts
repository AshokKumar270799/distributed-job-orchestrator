import type { JobsOptions } from "bullmq";
import { appConfig } from "../config/app-config";

export const defaultJobOptions: JobsOptions = {
  attempts: appConfig.jobAttempts,
  removeOnComplete: {
    age: 60 * 60,
    count: 1_000
  },
  removeOnFail: false
};
