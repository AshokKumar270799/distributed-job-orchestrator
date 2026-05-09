import type { Queue } from "bullmq";
import type { EmailDeadLetterJobPayload } from "../jobs/email-job";
import { createQueue } from "./queue-factory";
import { QueueName } from "./queue-names";

export const emailDeadLetterQueue: Queue<EmailDeadLetterJobPayload> =
  createQueue<EmailDeadLetterJobPayload>(QueueName.EmailDeadLetter);
