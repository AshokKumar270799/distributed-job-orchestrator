import type { JobProgress, JobState } from "bullmq";
import type { EmailJobName, EmailJobPayload, EmailJobResult } from "../jobs/email-job";
import { getEmailJob } from "../producers/email.producer";

export type TrackedJobState = Extract<
  JobState,
  "waiting" | "active" | "completed" | "failed"
>;

export interface JobStatusResponse {
  id: string;
  name: EmailJobName;
  state: JobState | "unknown";
  attemptsMade: number;
  progress: JobProgress;
  data: EmailJobPayload;
  result?: EmailJobResult;
  failedReason?: string;
  processedOn?: number;
  finishedOn?: number;
}

export const getEmailJobStatus = async (jobId: string): Promise<JobStatusResponse | null> => {
  const job = await getEmailJob(jobId);

  if (!job) {
    return null;
  }

  const state = await job.getState();

  return {
    id: String(job.id),
    name: job.name,
    state,
    attemptsMade: job.attemptsMade,
    progress: job.progress,
    data: job.data,
    result: job.returnvalue,
    failedReason: job.failedReason,
    processedOn: job.processedOn,
    finishedOn: job.finishedOn
  };
};
