import { Worker } from "bullmq";
import redis from "./redis.js";
import { sendVerificationEmail } from "./sendTokenMail.js";
export const emailWorker = new Worker(
  "emailQueue",
  async (job) =>
  {
    const { email, token } = job.data;
    if (!email || !token)
    {
      throw new Error("Invalid job data");
    }
    await sendVerificationEmail(email, token);
  },
  {
    connection: redis,
    concurrency: 5
  }
);
emailWorker.on("completed", (job) =>
{
  console.log(`Job ${job.id} completed`);
});

emailWorker.on("failed", (job, err) =>
{
  console.error(`Job ${job?.id} failed`, err.message);
});

emailWorker.on("error", (err) =>
{
  console.error("Worker error:", err);
});