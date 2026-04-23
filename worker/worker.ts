import { Worker } from "bullmq";
import redis from "./redis.js";
import { sendVerificationEmail, sendResetEmail } from "./sendTokenMail.js";

export const emailWorker = new Worker(
  "emailQueue",
  async (job) => {
    if (job.name === "send-verification") {
      const { email, token } = job.data;
      if (!email || !token) {
        throw new Error("Invalid job data: email and token required");
      }
      await sendVerificationEmail(email, token);
    } else if (job.name === "send-reset-email") {
      const { email, token } = job.data;
      if (!email || !token) {
        throw new Error("Invalid job data: email and token required");
      }
      await sendResetEmail(email, token);
    } else {
      throw new Error(`Unknown job type: ${job.name}`);
    }
  },
  {
    connection: redis,
    concurrency: 5
  }
);

emailWorker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

emailWorker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed`, err.message);
});

emailWorker.on("error", (err) => {
  console.error("Worker error:", err);
});