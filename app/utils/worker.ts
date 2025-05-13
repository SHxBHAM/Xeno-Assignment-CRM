import { Worker, Job } from "bullmq";
import { PrismaClient } from "@prisma/client";
import Redis from "ioredis";
import "dotenv/config";

const prisma = new PrismaClient();

if (!process.env.REDIS_URL) {
  throw new Error("REDIS_URL is not defined in the environment variables");
}

const redisConnection = new Redis(
  process.env.REDIS_URL || "redis://localhost:6379",
  {
    maxRetriesPerRequest: null, // This is required for blocking operations
  }
);

// Customer worker for processing users
const customerWorker = new Worker(
  "customer",
  async (job: Job<any[]>) => {
    console.log("Worker: Starting customer worker...");
    const users = job.data;

    if (!Array.isArray(users) || users.length === 0) {
      console.warn("Received empty or invalid batch.");
      return;
    }

    console.log(`Worker: Processing batch of ${users.length} users...`);

    await prisma.$transaction(async (tx) => {
      // First create users without addresses
      const usersWithoutAddress = users.map(({ address, ...user }) => user);

      await tx.user.createMany({
        data: usersWithoutAddress,
        skipDuplicates: true,
      });

      // Then create addresses with references to their users
      const addresses = users
        .filter((user) => user.address)
        .map((user) => ({
          userId: user.id,
          ...user.address,
        }));

      if (addresses.length > 0) {
        await tx.address.createMany({
          data: addresses,
          skipDuplicates: true,
        });
      }
    });

    console.log(
      `Worker: Batch of ${users.length} users processed successfully.`
    );
  },
  {
    connection: redisConnection,
    concurrency: 1, // Process one job at a time
  }
);

// Order worker for processing orders
const orderWorker = new Worker(
  "order",
  async (job: Job<any[]>) => {
    console.log("Order Worker: Starting order worker...");
    const orders = job.data;

    if (!Array.isArray(orders) || orders.length === 0) {
      console.warn("Received empty or invalid batch.");
      return;
    }

    console.log(`Worker: Processing batch of ${orders.length} orders...`);

    try {
      await prisma.$transaction(async (tx) => {
        // First, verify that all customer IDs exist in the database
        const customerIds = [
          ...new Set(orders.map((order) => order.customerId)),
        ];

        const existingCustomers = await tx.user.findMany({
          where: { id: { in: customerIds } },
          select: { id: true },
        });

        const existingCustomerIds = new Set(existingCustomers.map((c) => c.id));

        // Filter out orders with non-existent customer IDs
        const validOrders = orders.filter((order) =>
          existingCustomerIds.has(order.customerId)
        );

        if (validOrders.length < orders.length) {
          console.warn(
            `Skipping ${
              orders.length - validOrders.length
            } orders with non-existent customer IDs`
          );
        }

        if (validOrders.length === 0) {
          console.warn("No valid orders to process after filtering");
          return;
        }

        // Step 1: Strip out items to create orders
        const ordersWithoutItems = validOrders.map(
          ({ items, ...order }) => order
        );

        await tx.order.createMany({
          data: ordersWithoutItems,
          skipDuplicates: true,
        });

        // Step 2: Flatten items and attach orderId
        const allItems = validOrders
          .filter((order) => Array.isArray(order.items) && order.items.length)
          .flatMap((order) =>
            order.items.map((item) => ({
              ...item,
              orderId: order.id,
            }))
          );

        if (allItems.length > 0) {
          await tx.item.createMany({
            data: allItems,
            skipDuplicates: true,
          });
        }
      });

      console.log(
        `Worker: Batch of ${orders.length} orders processed successfully.`
      );
    } catch (error) {
      console.error("Transaction failed:", error);
      throw error; // Re-throw to trigger the 'failed' event
    }
  },
  {
    connection: redisConnection,
    concurrency: 1, // Process one job at a time
  }
);

// Campaign worker for processing campaigns
const BATCH_SIZE = 50;
const campaignWorker = new Worker(
  "campaign",
  async (job: Job<{ campaignId: string }>) => {
    if (job.name !== "process-campaign") {
      console.log(`Campaign Worker: Skipping unrelated job: ${job.name}`);
      return;
    }
    try {
      const { campaignId } = job.data;
      if (!campaignId) {
        console.warn("Campaign Worker: Received job without campaignId.");
        return;
      }
      console.log(`Campaign Worker: Processing campaignId: ${campaignId}`);

      // Fetch campaign and segment (with audienceUserIds)
      const campaign = await prisma.campaign.findUnique({
        where: { id: campaignId },
        include: { segment: true },
      });
      if (!campaign || !campaign.segment) {
        console.warn("Campaign Worker: Campaign or segment not found.");
        return;
      }
      const userIds: string[] = campaign.segment.audienceUserIds || [];
      if (userIds.length === 0) {
        console.warn("Campaign Worker: No users in segment audience.");
        await prisma.campaign.update({
          where: { id: campaignId },
          data: { status: "COMPLETED" },
        });
        return;
      }

      let sentCount = 0;
      let failedCount = 0;
      for (let i = 0; i < userIds.length; i += BATCH_SIZE) {
        const batchIds = userIds.slice(i, i + BATCH_SIZE);
        // Fetch user details for personalization
        const users = await prisma.user.findMany({
          where: { id: { in: batchIds } },
          select: { id: true, name: true, email: true },
        });
        // Create CommunicationLogs with status Processing
        const logs = await prisma.communicationLog.createMany({
          data: users.map((user) => ({
            campaignId: campaign.id,
            customerId: user.id,
            status: "PENDING",
            personalizedMessage: campaign.messageTemplate.replace(
              /{{name}}/g,
              user.name || "Customer"
            ),
          })),
        });

        // Simulate sending for each user
        for (const user of users) {
          // Simulate vendor API: 90% SENT, 10% FAILED
          const isSent = Math.random() < 0.9;
          const status = isSent ? "SENT" : "FAILED";
          if (isSent) sentCount++;
          else failedCount++;
          await prisma.communicationLog.updateMany({
            where: {
              campaignId: campaign.id,
              customerId: user.id,
            },
            data: {
              status,
              sentAt: new Date(),
              vendorMessageId: `msg_${campaign.id}_${user.id}`,
              deliveryReceiptStatus: status,
            },
          });
        }
      }
      // Update campaign stats and mark as COMPLETED
      await prisma.campaign.update({
        where: { id: campaign.id },
        data: {
          sentCount,
          failedCount,
          status: "COMPLETED",
        },
      });
      console.log(
        `Campaign Worker: Campaign ${campaignId} completed. Sent: ${sentCount}, Failed: ${failedCount}`
      );
    } catch (err) {
      console.error("Campaign Worker: Error processing job", err);
      throw err;
    }
  },
  {
    connection: redisConnection,
    concurrency: 10, // Process one campaign at a time
  }
);

// Event handlers for customer worker
customerWorker.on("failed", (job, err) => {
  console.error(`Customer Worker: Job failed [id=${job.id}]`, err);
});

customerWorker.on("completed", (job) => {
  console.log(`Customer Worker: Job completed [id=${job.id}]`);
});

// Event handlers for order worker
orderWorker.on("failed", (job, err) => {
  console.error(`Order Worker: Job failed [id=${job.id}]`, err);
});

orderWorker.on("completed", (job) => {
  console.log(`Order Worker: Job completed [id=${job.id}]`);
});

// Event handlers for campaign worker
campaignWorker.on("failed", (job, err) => {
  console.error(`Campaign Worker: Job failed [id=${job?.id}]`, err);
});

campaignWorker.on("completed", (job) => {
  console.log(`Campaign Worker: Job completed [id=${job.id}]`);
});

// Keep the process running
process.on("SIGTERM", async () => {
  await customerWorker.close();
  await orderWorker.close();
  await campaignWorker.close(); // Add campaign worker to graceful shutdown
});

console.log("Worker processes started");
