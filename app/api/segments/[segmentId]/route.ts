// Filepath: app/api/segments/[segmentId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface RouteContext {
  params: {
    segmentId: string;
  };
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { segmentId } = await context.params;

    if (!segmentId) {
      return NextResponse.json(
        { success: false, error: "Segment ID is required." },
        { status: 400 },
      );
    }

    // Validate if segmentId is a UUID (optional, but good practice)
    // A simple regex for UUID format. For stricter validation, use a library.
    const uuidRegex =
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    if (!uuidRegex.test(segmentId)) {
      return NextResponse.json(
        { success: false, error: "Invalid Segment ID format." },
        { status: 400 },
      );
    }

    const segment = await prisma.segment.findUnique({
      where: {
        id: segmentId,
      },
    });

    if (!segment) {
      return NextResponse.json(
        { success: false, error: "Segment not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: segment,
    });
  } catch (error) {
    console.error(
      `Error fetching segment with ID ${context.params.segmentId}:`,
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
