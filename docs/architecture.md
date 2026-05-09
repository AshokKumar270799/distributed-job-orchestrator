# Architecture

## Queue Flow

1. A client submits an email job through `POST /jobs/email`.
2. The HTTP server validates the payload and calls the email producer.
3. The producer writes a typed BullMQ job into the `email` queue.
4. One or more worker processes reserve jobs from Redis and process them asynchronously.
5. Clients can query `GET /jobs/email/:id` to inspect job state and result metadata.

## Worker Lifecycle

Email workers are separate Node.js processes started with `npm run dev:worker`.

Each worker:

- Connects to Redis using the shared BullMQ connection options.
- Processes jobs from the `email` queue.
- Supports configurable concurrency with `WORKER_CONCURRENCY`.
- Emits structured logs for readiness, errors, completion, failure, and stalled jobs.
- Closes workers, queue event streams, and queue connections during graceful shutdown.

Multiple worker processes can run on separate machines against the same Redis deployment.
BullMQ handles distributed locking so each job is processed by only one worker at a time.

## Retry Mechanism

Retry behavior is configured through queue defaults:

- `JOB_ATTEMPTS` controls the maximum number of processing attempts.
- `JOB_BACKOFF_DELAY_MS` controls the initial retry delay.
- BullMQ tracks attempt counts and requeues retryable failures automatically.

The default backoff type is exponential, which spaces retries farther apart after each failure.
This reduces pressure on downstream systems during partial outages.

## Dead-Letter Queue

When an email job fails after all configured attempts, the worker writes a failure record to the
`email:dead-letter` queue.

Dead-letter records include:

- Original job id and queue.
- Original payload.
- Failure reason.
- Failure timestamp.
- Number of attempts made.

This preserves permanently failed work for inspection, replay tooling, or manual remediation.

## Redis Interaction

Redis is the coordination layer for BullMQ.

The system uses Redis for:

- Queue storage.
- Job state transitions.
- Distributed worker locks.
- Retry scheduling.
- Queue event streams.
- Dead-letter queue storage.

Application-level Redis access is isolated in `src/config/redis.ts`. BullMQ queues use shared
connection options generated from `REDIS_URL`, while direct Redis clients can be reused by services
that need non-queue Redis operations later.

## Fault Tolerance

The service is designed around independent failure domains:

- HTTP producers can scale separately from workers.
- Worker crashes release jobs back to Redis after BullMQ lock expiry.
- Failed jobs retry with exponential backoff.
- Exhausted jobs are retained in the dead-letter queue.
- Graceful shutdown prevents dropping active work during deploys.

## Performance Notes

Bulk insertion uses BullMQ `addBulk` to reduce Redis round trips during load tests.
Queue event stream retention is bounded with `QUEUE_EVENTS_MAX_LEN` to avoid unbounded Redis growth
in long-running deployments.
