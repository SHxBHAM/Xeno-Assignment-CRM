import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { campaignId, customerId, vendorMessageId, status } =
      await request.json();
    if (!campaignId || !customerId || !vendorMessageId || !status) {
      return NextResponse.json(
        { success: false, message: "Missing required fields." },
        { status: 400 },
      );
    }
    // Update the CommunicationLog entry
    const updated = await prisma.communicationLog.updateMany({
      where: {
        campaignId,
        customerId,
        vendorMessageId,
      },
      data: {
        deliveryReceiptStatus: status,
        updatedAt: new Date(),
      },
    });
    if (updated.count === 0) {
      return NextResponse.json(
        { success: false, message: "Log not found." },
        { status: 404 },
      );
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delivery Receipt API error:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 },
    );
  }
}
