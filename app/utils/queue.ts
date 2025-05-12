// ingestion.controller.ts (or similar)
import { Queue } from "bullmq";
import Redis from "ioredis";
import "dotenv/config";

if (!process.env.REDIS_URL) {
  throw new Error("REDIS_URL is not defined in the environment variables");
}
const redisConnection = new Redis(process.env.REDIS_URL); // connect to your Valkey instance
export const customerQueue = new Queue("customer", {
  connection: redisConnection,
});

export const orderQueue = new Queue("order", {
  connection: redisConnection,
});

export const campaignQueue = new Queue("campaign", {
  connection: redisConnection,
});
