import express, { type Request, type Response } from "express";
import { appConfig } from "./config/app-config";
import { getHealthStatus } from "./services/health.service";

const app = express();

app.use(express.json());

app.get("/health", (_request: Request, response: Response) => {
  response.status(200).json(getHealthStatus());
});

app.listen(appConfig.port, () => {
  console.log(`${appConfig.serviceName} listening on port ${appConfig.port}`);
});
