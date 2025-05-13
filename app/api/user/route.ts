import chunk from "lodash.chunk";
import { z } from "zod";
import { customerQueue } from "../../utils/queue";

// Define the schema for an Address
const addressSchema = z.object({
  street: z.string(),
  city: z.string(),
  state: z.string(),
  zipCode: z.string(),
  country: z.string(),
});

// Define the schema for a single user, matching Prisma User model
const userSchema = z.object({
  id: z
    .string()
    .uuid({ message: "Invalid user ID format. Expected UUID." })
    .optional(), // Client might provide UUID
  name: z.string({ required_error: "Name is required." }),
  email: z.string().email({ message: "Invalid email address." }),
  phone: z.string({ required_error: "Phone number is required." }), // Assuming phone is required
  address: addressSchema.optional(), // Address can be optional
  createdAt: z
    .string()
    .datetime({
      message: "Invalid createdAt date format. Expected ISO string.",
    })
    .optional(), // Client might provide createdAt
});

// Define the schema for an array of users
const usersSchema = z.array(userSchema);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate the incoming data
    const validationResult = usersSchema.safeParse(body);

    if (!validationResult.success) {
      return Response.json(
        {
          success: false,
          error: "Invalid user data provided.",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const users = validationResult.data;

    console.log(`Processing ${users.length} users...`);
    const batchSize = 100;
    const userChunks = chunk(users, batchSize);

    const jobs: { name: string; data: any }[] = userChunks.map((chunk) => ({
      name: "persistent-batch",
      data: chunk,
    }));

    await customerQueue.addBulk(jobs);

    return Response.json({
      success: true,
      message: `Successfully queued ${users.length} users in ${userChunks.length} batches`,
    });
  } catch (error) {
    console.error("Error processing users:", error);
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
