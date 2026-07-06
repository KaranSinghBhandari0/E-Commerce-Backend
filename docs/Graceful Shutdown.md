# Graceful Shutdown in Node.js + MongoDB

## What is Graceful Shutdown?

Graceful shutdown is the process of **safely stopping an application** without interrupting requests, losing data, or leaving resources (such as database connections) open.

Instead of terminating the application immediately, the server:

1. Stops accepting new requests.
2. Completes the requests that are already in progress.
3. Closes database connections.
4. Cleans up any other resources.
5. Exits the process safely.

Without graceful shutdown, your application may terminate while users are still sending requests, leading to failed API calls, corrupted data, or memory/resource leaks.

---

## Why is it Important?

Imagine your backend is running inside Docker, Kubernetes, Railway, Render, or any cloud provider.

Whenever you:

- Deploy a new version
- Restart the server
- Scale down containers
- Stop the application manually (`Ctrl + C`)
- Encounter a termination signal

the operating system first sends a signal asking the application to stop.

If the application exits immediately:

- Active requests are cancelled.
- Database writes may remain incomplete.
- Open MongoDB connections stay alive for a short period.
- Users receive unexpected errors.

Graceful shutdown prevents these problems.

---

## Shutdown Flow

```text
           SIGINT / SIGTERM
                  │
                  ▼
      Stop accepting new requests
                  │
                  ▼
     Finish in-progress HTTP requests
                  │
                  ▼
      Close MongoDB connection
                  │
                  ▼
      Release other resources
                  │
                  ▼
            Exit process
```

---

# Common Shutdown Signals

## SIGINT

Sent when the user manually stops the application.

Example:

```bash
Ctrl + C
```

Used mainly during local development.

---

## SIGTERM

Sent by operating systems, Docker, Kubernetes, Railway, Render, AWS, etc., when they want the application to terminate.

Examples:

- Docker container stopping
- Kubernetes pod termination
- Cloud deployment restart
- Process manager restart (PM2, systemd)

This is the most important signal to handle in production.

---

## Example

```javascript
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
```

Whenever either signal is received, the `shutdown()` function executes.

---

# What Should Be Closed?

A typical Node.js backend should clean up the following resources:

- HTTP Server
- MongoDB connection
- Redis connection
- RabbitMQ connection
- Kafka consumer
- Cron jobs
- Worker threads
- File handles
- Logging transports

---

# Graceful Shutdown with MongoDB

When using Mongoose, always close the database connection before exiting.

```javascript
await mongoose.connection.close();
```

This ensures:

- Pending database operations complete.
- Connection pools are released.
- No hanging connections remain.

---

# Closing the HTTP Server

Suppose your Express server is running like this:

```javascript
const server = app.listen(PORT);
```

During shutdown:

```javascript
server.close(() => {
  console.log('HTTP server closed');
});
```

Calling `server.close()`:

- Stops accepting new requests.
- Allows existing requests to finish.
- Invokes the callback once all active connections are closed.

---

# Typical Shutdown Function

```javascript
const shutdown = async () => {
  try {
    console.log('Shutdown initiated...');

    server.close(async () => {
      await mongoose.connection.close();

      console.log('Resources released');

      process.exit(0);
    });
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
```

---

# Exit Codes

| Exit Code | Meaning                  |
| --------- | ------------------------ |
| 0         | Successful shutdown      |
| 1         | Shutdown due to an error |

Example:

```javascript
process.exit(0);
```

---

# Why Not Just Use `process.exit()`?

Calling:

```javascript
process.exit();
```

immediately terminates Node.js.

This means:

- Requests are aborted.
- Database operations may be interrupted.
- Logs may not be flushed.
- Cleanup code never executes.

Instead, always clean up resources first, then exit.

---

# Best Practices

- Listen for both `SIGINT` and `SIGTERM`.
- Stop accepting new requests before exiting.
- Close MongoDB connections.
- Release external resources (Redis, RabbitMQ, etc.).
- Exit with `0` on success and `1` on failure.
- Log shutdown events for easier debugging.
- Set a shutdown timeout (e.g., 10–30 seconds) to force exit if cleanup hangs.

Example:

```javascript
setTimeout(() => {
  console.error('Forced shutdown');
  process.exit(1);
}, 10000);
```

---

# Benefits

- Prevents data loss
- Prevents interrupted database writes
- Avoids connection leaks
- Ensures zero-downtime deployments
- Improves application reliability
- Plays well with Docker and Kubernetes
- Makes production deployments safer

---

# Summary

Graceful shutdown is a production best practice that allows a Node.js application to terminate safely.

Instead of exiting immediately, the application:

1. Receives a termination signal (`SIGINT` or `SIGTERM`).
2. Stops accepting new requests.
3. Finishes active requests.
4. Closes MongoDB and other resources.
5. Exits with the appropriate status code.

Implementing graceful shutdown helps ensure reliable deployments, protects data integrity, and keeps your application stable in production environments.
