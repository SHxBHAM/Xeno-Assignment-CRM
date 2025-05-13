// Filepath: app/api/campaigns/[campaignId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface RouteContext {
  params: {
    campaignId: string;
  };
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { campaignId } = context.params;

    if (!campaignId) {
      return NextResponse.json(
        { success: false, error: "Campaign ID is required." },
        { status: 400 },
      );
    }

    // Basic UUID validation
    const uuidRegex =
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    if (!uuidRegex.test(campaignId)) {
      return NextResponse.json(
        { success: false, error: "Invalid Campaign ID format." },
        { status: 400 },
      );
    }

    const campaign = await prisma.campaign.findUnique({
      where: {
        id: campaignId,
      },
      include: {
        segment: {
          select: {
            name: true, // Include the name of the associated segment
            id: true, // Also include segment ID for completeness
            rules: true, // Include segment rules
            audienceUserIds: true, // Include audience user IDs
          },
        },
      },
    });

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: "Campaign not found." },
        { status: 404 },
      );
    }

    // Optionally, flatten segment details if preferred, or return as is
    const responseData = {
      ...campaign,
      // segmentName: campaign.segment.name, // Example if you want to flatten
    };

    return NextResponse.json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error(
      `Error fetching campaign with ID ${context.params.campaignId}:`,
      error,
    );
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 },
    );
  }
}

// Removed PUT handler function
