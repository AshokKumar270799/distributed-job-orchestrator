import type { EmailJobPayload, EmailJobResult } from "../jobs/email-job";

const wait = (milliseconds: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });

export const sendEmail = async (payload: EmailJobPayload): Promise<EmailJobResult> => {
  await wait(100);

  return {
    deliveredAt: new Date().toISOString(),
    recipient: payload.to
  };
};
