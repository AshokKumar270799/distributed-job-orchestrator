import type { Queue } from "bullmq";
import type { EmailJobPayload, EmailJobResult } from "../jobs/email-job";
import { createQueue } from "./queue-factory";
import { QueueName } from "./queue-names";

export const emailQueue: Queue<EmailJobPayload, EmailJobResult> = createQueue<
  EmailJobPayload,
  EmailJobResult
>(QueueName.Email);
