import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, User, Order, Address } from "@prisma/client"; // Import Prisma-generated types
import {
  segmentRulesSchema,
  SegmentRules,
  Condition,
} from "../../../lib/segment-rules-schema"; // Adjust path
import { subDays, isBefore, isAfter, isEqual, parseISO } from "date-fns";
import {
  UserAggregates, // If needed directly in the route, otherwise it's used by the imported functions
  UserWithRelations,
  calculateUserAggregates,
  evaluateCondition, // Also likely used internally by evaluateUserAgainstRuleGroups
  evaluateUserAgainstRuleGroups,
} from "../../../lib/segmentation-logic";

const prisma = new PrismaClient();

// Interface for derived aggregates
// --- API Route Handler ---
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = segmentRulesSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid segment rule data provided.",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const rules: SegmentRules = validationResult.data;
    let audienceSize = 0;
    const sampleUserIds: string[] = [];
    const MAX_SAMPLE_SIZE = 10;

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
        audienceSize++;
        if (sampleUserIds.length < MAX_SAMPLE_SIZE) {
          sampleUserIds.push(user.id);
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        audienceSize: audienceSize,
        sampleUserIds: sampleUserIds,
        evaluatedUserCount: users.length,
        rulesUsed: rules,
      },
    });
  } catch (error) {
    console.error("Error processing segment preview:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 },
    );
  }
}
