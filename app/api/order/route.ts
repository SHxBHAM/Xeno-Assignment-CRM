import chunk from "lodash.chunk";
import { z } from "zod";
import { orderQueue } from "../../utils/queue";

// Define the schema for a single Item, matching Prisma Item model
const itemSchema = z.object({
  id: z
    .string()
    .uuid({ message: "Invalid item ID format. Expected UUID." })
    .optional(), // Client might provide UUID
  productId: z.string({ required_error: "Product ID is required." }),
  name: z.string({ required_error: "Item name is required." }),
  price: z
    .number()
    .int()
    .positive({ message: "Item price must be a positive integer." }),
  quantity: z
    .number()
    .int()
    .positive({ message: "Item quantity must be a positive integer." }),
  total: z
    .number()
    .int()
    .positive({ message: "Item total must be a positive integer." }),
});

// Define the schema for a single Order, matching Prisma Order model
const orderSchema = z.object({
  id: z
    .string()
    .uuid({ message: "Invalid order ID format. Expected UUID." })
    .optional(), // Client might provide UUID
  customerId: z
    .string()
    .uuid({ message: "Invalid customer ID format. Expected UUID." }),
  items: z
    .array(itemSchema)
    .min(1, { message: "Order must contain at least one item." }),
  totalAmount: z
    .number()
    .int()
    .positive({ message: "Order total amount must be a positive integer." }),
  currency: z.string({ required_error: "Currency is required." }),
  status: z.string({ required_error: "Order status is required." }),
  createdAt: z
    .string()
    .datetime({
      message: "Invalid createdAt date format. Expected ISO string.",
    })
    .optional(),
});

// Define the schema for an array of orders
const ordersSchema = z.array(orderSchema);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate the incoming data
    const validationResult = ordersSchema.safeParse(body);

    if (!validationResult.success) {
      return Response.json(
        {
          success: false,
          error: "Invalid order data provided.",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const orders = validationResult.data;

    console.log(`Processing ${orders.length} orders...`);
    const batchSize = 100;
    const orderChunks = chunk(orders, batchSize);

    const jobs: { name: string; data: any }[] = orderChunks.map((chunk) => ({
      name: "persistent-order-batch",
      data: chunk,
    }));

    if (!orderQueue) {
      console.error("Order queue is not initialized.");
      return Response.json(
        { success: false, error: "Order processing system is not ready." },
        { status: 503 },
      );
    }
    await orderQueue.addBulk(jobs);

    return Response.json({
      success: true,
      message: `Successfully queued ${orders.length} orders in ${orderChunks.length} batches`,
    });
  } catch (error) {
    console.error("Error processing orders:", error);
    return Response.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred.",
      },
      { status: 500 },
    );
  }
}
