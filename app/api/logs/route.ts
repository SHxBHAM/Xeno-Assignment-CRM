import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);
  const skip = (page - 1) * pageSize;

  const [logs, total] = await Promise.all([
    prisma.communicationLog.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
      include: {
        campaign: { select: { name: true } },
        customer: { select: { email: true } },
      },
    }),
    prisma.communicationLog.count(),
  ]);

  return NextResponse.json({
    success: true,
    data: logs,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
}
