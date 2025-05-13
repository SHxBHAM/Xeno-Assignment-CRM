import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, User, Order, Address, Prisma } from "@prisma/client"; // Import Prisma types
import { z } from "zod";
import {
  segmentRulesSchema,
  SegmentRules,
  Condition,
} from "../../lib/segment-rules-schema"; // Adjust path
import { subDays, isBefore, isAfter, isEqual, parseISO } from "date-fns";
import {
  UserAggregates, // If needed directly in the route, otherwise it's used by the imported functions
  UserWithRelations,
  calculateUserAggregates,
  evaluateCondition, // Also likely used internally by evaluateUserAgainstRuleGroups
  evaluateUserAgainstRuleGroups,
} from "../../lib/segmentation-logic";
const prisma = new PrismaClient();

// --- Zod Schema for Create Segment ---
const createSegmentSchema = z.object({
  name: z.string().min(3, "Segment name must be at least 3 characters long."),
  rules: segmentRulesSchema,
});
type CreateSegmentPayload = z.infer<typeof createSegmentSchema>;

// --- API Route Handler for POST /api/segments ---
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = createSegmentSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid segment data provided.",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { name, rules } = validationResult.data;
    const audienceUserIds: string[] = [];

    // Fetch all users with their orders and address for segmentation
    const usersFromDb = await prisma.user.findMany({
      include: {
        Order: true,
        address: true,
      },
    });
    const users: UserWithRelations[] = usersFromDb as UserWithRelations[];

    for (const user of users) {
      const aggregates = calculateUserAggregates(user);
      if (evaluateUserAgainstRuleGroups(user, aggregates, rules)) {
        audienceUserIds.push(user.id);
      }
    }

    // Store the segment in the database
    // The 'rules' field in Prisma Segment model is Json. Prisma handles serialization.
    const newSegment = await prisma.segment.create({
      data: {
        name: name,
        rules: rules as any, // Cast to 'any' or Prisma.JsonValue if type conflict
        audienceUserIds: audienceUserIds,
        // id will be auto-generated (UUID)
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: `Segment "${newSegment.name}" created successfully with ${audienceUserIds.length} users.`,
        data: newSegment,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating segment:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle specific Prisma errors, e.g., unique constraint violation if segment names must be unique
      if (error.code === "P2002") {
        return NextResponse.json(
          { success: false, error: "A segment with this name already exists." },
          { status: 409 },
        );
      }
    }
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 },
    );
  }
}

// --- API Route Handler for GET /api/segments ---
export async function GET(request: NextRequest) {
  try {
    const segments = await prisma.segment.findMany({
      orderBy: {
        createdAt: "desc", // Optional: order by creation date
      },
      // Optionally, you might want to select specific fields or include related data
      // select: { id: true, name: true, createdAt: true, audienceUserIds: true } // Example
    });

    return NextResponse.json({
      success: true,
      data: segments,
    });
  } catch (error) {
    console.error("Error fetching segments:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 },
    );
  }
}
