import { emailDeadLetterQueue } from "../queues/email-dead-letter.queue";
import { emailQueue } from "../queues/email.queue";
import { enqueueEmailJobsBulk } from "../producers/email.producer";
import { logger } from "../utils/logger";

const getJobCount = (): number => {
  const rawCount = process.argv[2];
  const count = rawCount ? Number(rawCount) : 1_000;
  return Number.isFinite(count) && count > 0 ? count : 1_000;
};

const run = async (): Promise<void> => {
  const jobCount = getJobCount();
  const startedAt = performance.now();

  await enqueueEmailJobsBulk(
    Array.from({ length: jobCount }, (_, index) => ({
        to: `load-test-${index}@example.com`,
        subject: `Load test job ${index}`,
        body: "Synthetic load test email payload",
        correlationId: `load-test-${Date.now()}-${index}`
      })
    )
  );

  const durationMs = performance.now() - startedAt;

  logger.info("Bulk enqueue completed", {
    jobCount,
    durationMs: Math.round(durationMs),
    jobsPerSecond: Math.round((jobCount / durationMs) * 1_000)
  });

  await emailQueue.close();
  await emailDeadLetterQueue.close();
};

run().catch(async (error: unknown) => {
  logger.error("Bulk enqueue failed", {
    error: error instanceof Error ? error.message : String(error)
  });

  await emailQueue.close();
  await emailDeadLetterQueue.close();
  process.exit(1);
});
