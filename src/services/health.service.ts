import { appConfig } from "../config/app-config";

export interface HealthStatus {
  status: "ok";
  service: string;
  environment: string;
  uptimeSeconds: number;
  timestamp: string;
}

export const getHealthStatus = (): HealthStatus => ({
  status: "ok",
  service: appConfig.serviceName,
  environment: appConfig.env,
  uptimeSeconds: Math.round(process.uptime()),
  timestamp: new Date().toISOString()
});
