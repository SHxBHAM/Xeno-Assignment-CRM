import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { campaignId: string } },
) {
  const { campaignId } = params;
  if (!campaignId) {
    return NextResponse.json(
      { success: false, message: "Missing campaignId." },
      { status: 400 },
    );
  }
  try {
    const logs = await prisma.communicationLog.findMany({
      where: { campaignId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: logs });
  } catch (err) {
    console.error("Error fetching campaign logs:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 },
    );
  }
}
