import { EmailJobName, type EmailJobPayload, type EmailJobResult } from "../jobs/email-job";
import { emailQueue } from "../queues/email.queue";

export interface EnqueueEmailJobResponse {
  id: string;
  queue: string;
  name: EmailJobName;
}

export const enqueueEmailJob = async (
  payload: EmailJobPayload
): Promise<EnqueueEmailJobResponse> => {
  const job = await emailQueue.add(EmailJobName.SendEmail, payload);

  return {
    id: String(job.id),
    queue: job.queueName,
    name: job.name as EmailJobName
  };
};

export const enqueueEmailJobsBulk = async (
  payloads: EmailJobPayload[]
): Promise<EnqueueEmailJobResponse[]> => {
  const jobs = await emailQueue.addBulk(
    payloads.map((payload) => ({
      name: EmailJobName.SendEmail,
      data: payload
    }))
  );

  return jobs.map((job) => ({
    id: String(job.id),
    queue: job.queueName,
    name: job.name as EmailJobName
  }));
};

export const getEmailJob = async (jobId: string) =>
  emailQueue.getJob(jobId) as Promise<
    import("bullmq").Job<EmailJobPayload, EmailJobResult, EmailJobName> | undefined
  >;
