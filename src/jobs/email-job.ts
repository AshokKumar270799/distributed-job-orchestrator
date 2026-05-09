export const EmailJobName = {
  SendEmail: "email.send"
} as const;

export type EmailJobName = (typeof EmailJobName)[keyof typeof EmailJobName];

export interface EmailJobPayload {
  to: string;
  subject: string;
  body: string;
  correlationId?: string;
}

export interface EmailJobResult {
  deliveredAt: string;
  recipient: string;
}
