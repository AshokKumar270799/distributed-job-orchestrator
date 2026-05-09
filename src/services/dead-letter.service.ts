import type { Job } from "bullmq";
import type { EmailJobName, EmailJobPayload, EmailJobResult } from "../jobs/email-job";
import { emailDeadLetterQueue } from "../queues/email-dead-letter.queue";

export const moveEmailJobToDeadLetter = async (
  job: Job<EmailJobPayload, EmailJobResult, EmailJobName>,
  error: Error
): Promise<void> => {
  const attemptsLimit = job.opts.attempts ?? 1;

  if (job.attemptsMade < attemptsLimit) {
    return;
  }

  await emailDeadLetterQueue.add("email.dead-letter", {
    originalJobId: String(job.id),
    originalQueue: job.queueName,
    payload: job.data,
    reason: error.message,
    failedAt: new Date().toISOString(),
    attemptsMade: job.attemptsMade
  });
};
