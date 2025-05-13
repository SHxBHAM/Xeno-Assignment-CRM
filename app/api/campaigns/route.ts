import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, CampaignStatus, Prisma, User } from "@prisma/client";
import { createCampaignAndSegmentSchema } from "../../lib/campaign-schema"; // Updated schema import
import {
  UserWithRelations,
  calculateUserAggregates,
  evaluateUserAgainstRuleGroups,
} from "../../lib/segmentation-logic"; // Import segmentation logic helpers
import { campaignQueue } from "../../utils/queue"; // Import campaignQueue

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Use the new combined schema for validation
    const validationResult = createCampaignAndSegmentSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid campaign and segment data provided.",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { campaignName, message, segmentName, segmentRules } =
      validationResult.data; // Removed scheduledAt

    // --- Begin Segment Creation Logic ---
    const audienceUserIds: string[] = [];
    const usersFromDb = await prisma.user.findMany({
      include: {
        Order: true,
        address: true,
      },
    });
    const users: UserWithRelations[] = usersFromDb as UserWithRelations[]; // Cast needed if Prisma types are not perfectly inferred with includes

    for (const user of users) {
      const aggregates = calculateUserAggregates(user);
      if (evaluateUserAgainstRuleGroups(user, aggregates, segmentRules)) {
        audienceUserIds.push(user.id);
      }
    }

    const newSegment = await prisma.segment.create({
      data: {
        name: segmentName,
        rules: segmentRules as any, // Prisma expects JsonValue, Zod schema is more specific
        audienceUserIds: audienceUserIds,
      },
    });
    // --- End Segment Creation Logic ---

    const audienceSize = newSegment.audienceUserIds.length;

    // Create Campaign record in DB, using the newSegment.id
    // Status will default to PROCESSING as per schema, scheduledAt is removed
    const newCampaign = await prisma.campaign.create({
      data: {
        name: campaignName,
        messageTemplate: message,
        segmentId: newSegment.id, // Use the ID of the segment just created
        audienceSize,
        sentCount: 0,
        failedCount: 0,
      },
    });

    // For now, assume all PROCESSING campaigns are to be queued
    if (newCampaign.status === CampaignStatus.PROCESSING) {
      await campaignQueue.add("process-campaign", {
        campaignId: newCampaign.id,
      });
      console.log(
        `Campaign ${newCampaign.id} added to process-campaign queue.`,
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: `Segment "${newSegment.name}" and Campaign "${newCampaign.name}" created successfully. Campaign status: ${newCampaign.status}.`,
        data: {
          segment: newSegment,
          campaign: newCampaign,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating campaign and segment:", error);
    let errorMessage = "An unexpected error occurred.";
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        // Unique constraint failed (e.g. if segment names must be unique)
        errorMessage = `Failed to create segment or campaign due to a unique constraint violation. Field: ${error.meta?.target}`;
        return NextResponse.json(
          { success: false, error: errorMessage, details: error.meta },
          { status: 409 },
        );
      }
      // Potentially other Prisma errors like foreign key if segment creation failed in an unexpected way before campaign creation
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 },
    );
  }
}

// --- API Route Handler for GET /api/campaigns ---
export async function GET(request: NextRequest) {
  try {
    const campaigns = await prisma.campaign.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        segment: {
          select: {
            name: true,
          },
        },
      },
    });

    // For PROCESSING campaigns, get live status counts from communicationLog
    const processingCampaigns = campaigns.filter(
      (c) => c.status === "PROCESSING"
    );
    let logCounts: Record<
      string,
      { sent: number; delivered: number; failed: number; pending: number }
    > = {};
    if (processingCampaigns.length > 0) {
      const allCounts = await Promise.all(
        processingCampaigns.map(async (c) => {
          const [sent, delivered, failed, pending] = await Promise.all([
            prisma.communicationLog.count({
              where: { campaignId: c.id, status: "SENT" },
            }),
            prisma.communicationLog.count({
              where: { campaignId: c.id, status: "DELIVERED" },
            }),
            prisma.communicationLog.count({
              where: { campaignId: c.id, status: "FAILED" },
            }),
            prisma.communicationLog.count({
              where: { campaignId: c.id, status: "PENDING" },
            }),
          ]);
          return { id: c.id, sent, delivered, failed, pending };
        })
      );
      logCounts = Object.fromEntries(
        allCounts.map((x) => [
          x.id,
          {
            sent: x.sent,
            delivered: x.delivered,
            failed: x.failed,
            pending: x.pending,
          },
        ])
      );
    }

    return NextResponse.json({
      success: true,
      data: campaigns.map((campaign) => {
        let sentCount = campaign.sentCount;
        let failedCount = campaign.failedCount;
        let deliveredCount = 0;
        let pendingCount = 0;
        if (campaign.status === "PROCESSING" && logCounts[campaign.id]) {
          sentCount = logCounts[campaign.id].sent;
          failedCount = logCounts[campaign.id].failed;
          deliveredCount = logCounts[campaign.id].delivered;
          pendingCount = logCounts[campaign.id].pending;
        }
        return {
          ...campaign,
          sentCount,
          failedCount,
          deliveredCount,
          pendingCount,
          segmentName: campaign.segment.name,
        };
      }),
    });
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 },
    );
  }
}
