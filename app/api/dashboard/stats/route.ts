import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const [totalCustomers, totalCampaigns, totalSales, totalSegments] =
      await Promise.all([
        prisma.user.count(),
        prisma.campaign.count(),
        prisma.order.count(),
        prisma.segment.count(),
      ]);
    return NextResponse.json({
      success: true,
      data: {
        totalCustomers,
        totalCampaigns,
        totalSales,
        totalSegments,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch dashboard stats." },
      { status: 500 }
    );
  }
}
