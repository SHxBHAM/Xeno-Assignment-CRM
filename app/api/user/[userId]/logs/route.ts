import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } },
) {
  const { userId } = params;
  if (!userId) {
    return NextResponse.json(
      { success: false, message: "Missing userId." },
      { status: 400 },
    );
  }
  try {
    const logs = await prisma.communicationLog.findMany({
      where: { customerId: userId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: logs });
  } catch (err) {
    console.error("Error fetching user logs:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 },
    );
  }
}
