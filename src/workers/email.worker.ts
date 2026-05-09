import { Worker, type Job } from "bullmq";
import { appConfig } from "../config/app-config";
import { getBullMqConnectionOptions } from "../config/redis";
import { EmailJobName, type EmailJobPayload, type EmailJobResult } from "../jobs/email-job";
import { QueueName } from "../queues/queue-names";
import { createQueueEvents } from "../queues/queue-events";
import { moveEmailJobToDeadLetter } from "../services/dead-letter.service";
import { sendEmail } from "../services/email.service";
import { logger } from "../utils/logger";

export const createEmailWorker = (): Worker<EmailJobPayload, EmailJobResult, EmailJobName> =>
  new Worker<EmailJobPayload, EmailJobResult, EmailJobName>(
    QueueName.Email,
    async (job: Job<EmailJobPayload, EmailJobResult, EmailJobName>) => {
      if (job.name !== EmailJobName.SendEmail) {
        throw new Error(`Unsupported email job: ${job.name}`);
      }

      return sendEmail(job.data);
    },
    {
      connection: getBullMqConnectionOptions(),
      concurrency: appConfig.workerConcurrency
    }
  );

if (require.main === module) {
  const worker = createEmailWorker();
  createQueueEvents(QueueName.Email);

  worker.on("ready", () => {
    logger.info("Email worker ready", {
      concurrency: appConfig.workerConcurrency
    });
  });

  worker.on("error", (error) => {
    logger.error("Email worker error", {
      message: error.message,
      name: error.name
    });
  });

  worker.on("failed", (job, error) => {
    if (job) {
      void moveEmailJobToDeadLetter(job, error);
    }
  });
}
