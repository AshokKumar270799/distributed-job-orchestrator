import express, { type Request, type Response } from "express";
import { appConfig } from "./config/app-config";
import type { EmailJobPayload } from "./jobs/email-job";
import { enqueueEmailJob } from "./producers/email.producer";
import { getHealthStatus } from "./services/health.service";
import { getEmailJobStatus } from "./services/job-status.service";
import { logger } from "./utils/logger";

const app = express();

app.use(express.json());

app.get("/health", (_request: Request, response: Response) => {
  response.status(200).json(getHealthStatus());
});

app.post("/jobs/email", async (request: Request, response: Response) => {
  const payload = request.body as Partial<EmailJobPayload>;

  if (!payload.to || !payload.subject || !payload.body) {
    response.status(400).json({
      error: "Email jobs require to, subject, and body"
    });
    return;
  }

  const job = await enqueueEmailJob({
    to: payload.to,
    subject: payload.subject,
    body: payload.body,
    correlationId: payload.correlationId
  });

  response.status(202).json(job);
});

app.get("/jobs/email/:id", async (request: Request, response: Response) => {
  const jobId = request.params.id;

  if (!jobId || Array.isArray(jobId)) {
    response.status(400).json({ error: "Job id is required" });
    return;
  }

  const status = await getEmailJobStatus(jobId);

  if (!status) {
    response.status(404).json({ error: "Job not found" });
    return;
  }

  response.status(200).json(status);
});

app.listen(appConfig.port, () => {
  logger.info("HTTP server listening", {
    service: appConfig.serviceName,
    port: appConfig.port
  });
});
