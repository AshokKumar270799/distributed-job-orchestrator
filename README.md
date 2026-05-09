# Distributed Job Queue System

Production-grade distributed job queue system built with Node.js, TypeScript, Redis, BullMQ, and Express.

It demonstrates asynchronous background processing, retry and recovery patterns, dead-letter queues,
worker scalability, queue observability, and graceful shutdown behavior.

## Features

- Express API for enqueueing and tracking jobs.
- BullMQ queue orchestration backed by Redis.
- Typed email job producer and worker.
- Configurable retries with exponential backoff.
- Dead-letter queue for permanently failed jobs.
- Configurable worker concurrency.
- Queue event listeners for completed, failed, and stalled jobs.
- Structured JSON logging.
- Graceful shutdown for HTTP server, queues, workers, and Redis connections.
- Bulk enqueue load test script.

## Requirements

- Node.js 20 or later.
- Redis 7 or later.

## Setup

Install dependencies:

```bash
npm install
```

Create an environment file:

```bash
cp .env.example .env
```

Start Redis locally:

```bash
redis-server
```

Run the API:

```bash
npm run dev
```

Run a worker in another terminal:

```bash
npm run dev:worker
```

## Configuration

| Variable | Default | Description |
| --- | --- | --- |
| `PORT` | `3000` | HTTP server port. |
| `SERVICE_NAME` | `distributed-job-queue-system` | Service name in logs and health checks. |
| `REDIS_URL` | `redis://127.0.0.1:6379` | Redis connection URL. |
| `JOB_ATTEMPTS` | `3` | Maximum attempts before dead-lettering. |
| `JOB_BACKOFF_DELAY_MS` | `1000` | Initial exponential backoff delay. |
| `WORKER_CONCURRENCY` | `5` | Jobs processed concurrently per worker process. |
| `QUEUE_EVENTS_MAX_LEN` | `10000` | Max retained BullMQ queue events. |

## API

Health check:

```bash
curl http://localhost:3000/health
```

Enqueue an email job:

```bash
curl -X POST http://localhost:3000/jobs/email \
  -H "Content-Type: application/json" \
  -d '{"to":"user@example.com","subject":"Welcome","body":"Hello from BullMQ"}'
```

Check job status:

```bash
curl http://localhost:3000/jobs/email/<job-id>
```

Tracked states include `waiting`, `active`, `completed`, and `failed`, with BullMQ metadata returned
for attempts, progress, failure reason, and result data.

## Architecture

The HTTP server accepts work and writes jobs to Redis through BullMQ. Worker processes run separately
and reserve jobs from Redis using BullMQ locks, allowing producers and consumers to scale independently.

System flow:

```text
Client
  -> Express API
  -> Email Producer
  -> BullMQ Email Queue
  -> Redis
  -> Email Worker
  -> Completed Result / Retry / Dead-Letter Queue
```

### Core Components

| Component | Responsibility |
| --- | --- |
| Express API | Accepts job requests, exposes health checks, and returns job status. |
| Email Producer | Converts validated API payloads into typed BullMQ jobs. |
| BullMQ Queues | Store pending, active, completed, failed, delayed, and dead-letter jobs. |
| Redis | Central coordination layer for queue state, locks, retries, events, and scheduling. |
| Email Worker | Processes email jobs asynchronously with configurable concurrency. |
| Queue Events | Emits lifecycle events for completed, failed, and stalled jobs. |
| Structured Logger | Produces JSON logs for API, Redis, worker, and queue lifecycle monitoring. |

### Queue Lifecycle

1. A client submits an email payload through `POST /jobs/email`.
2. The API validates required fields and calls the email producer.
3. BullMQ persists the job in Redis with retry and backoff options.
4. A worker reserves the job, moves it to `active`, and processes it asynchronously.
5. Successful jobs move to `completed` with a typed result payload.
6. Failed jobs are retried with exponential backoff until attempts are exhausted.
7. Permanently failed jobs are copied to `email:dead-letter` with failure context.

### Worker Lifecycle

Workers are independent processes and can be scaled horizontally. Each worker connects to Redis,
subscribes to the `email` queue, processes jobs up to `WORKER_CONCURRENCY`, and listens for queue
events. During shutdown, the worker closes active BullMQ connections and queue event streams before
the process exits.

### Redis Interaction

Redis stores job payloads, job state transitions, retry schedules, distributed locks, queue event
streams, and dead-letter records. BullMQ uses Redis locking to ensure a job is owned by one worker at
a time, even when many workers are running across multiple machines.

### Failure Handling

The system treats failures as part of the normal queue lifecycle. Transient failures retry using
exponential backoff. Stalled jobs are surfaced through queue events. Exhausted jobs are retained in
the dead-letter queue so operators can inspect, replay, or remediate them later.

See [docs/architecture.md](docs/architecture.md) for the extended system design notes.

## Retry Flow

1. A worker throws an error while processing a job.
2. BullMQ marks the attempt as failed.
3. If attempts remain, the job is delayed using exponential backoff.
4. A worker retries the job after the delay.
5. If all attempts fail, the worker writes a failure record to `email:dead-letter`.

## Scalability

Scale producers by running more API instances. Scale consumers by running more worker processes on the
same or different machines. Increase `WORKER_CONCURRENCY` when jobs are I/O bound and the downstream
service can tolerate more parallelism.

Redis is the central coordination dependency. In production, use managed Redis or a highly available
Redis deployment with persistence and monitoring enabled.

## Benchmarking

Bulk enqueue jobs:

```bash
npm run load:test -- 10000
```

The script uses BullMQ `addBulk` to reduce Redis round trips and logs enqueue duration and jobs per
second. Run one or more workers separately to measure processing throughput.

## Trade-Offs

- BullMQ provides robust queue semantics without building custom Redis locking logic.
- Redis centralizes coordination, which simplifies scaling but makes Redis availability critical.
- Dead-letter queues preserve failed work but require operational replay or inspection tooling.
- Higher worker concurrency improves throughput for I/O-bound jobs but can overload downstream systems.

## Production Notes

- Run API and worker processes independently.
- Use process managers or orchestration platforms that send `SIGTERM` before termination.
- Monitor Redis memory, queue depth, failed job count, stalled jobs, and worker throughput.
- Keep job payloads small and store large artifacts in object storage.
- Add authentication and request validation before exposing the API publicly.
