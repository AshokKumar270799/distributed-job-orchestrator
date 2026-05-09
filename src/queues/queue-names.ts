export const QueueName = {
  Email: "email",
  EmailDeadLetter: "email:dead-letter"
} as const;

export type QueueName = (typeof QueueName)[keyof typeof QueueName];
