import { Queue } from "bullmq";
import redis from "./redis.js";
export const emailQueue=new Queue("emailQueue",{
  connection:redis
})