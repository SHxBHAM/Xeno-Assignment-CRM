import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const url = new URL(req.url)
    const isPreview = url.pathname.endsWith('/preview')
    const { name, rules } = await req.json()

    // For preview, we only calculate audience size without saving
    if (isPreview) {
      // In a real implementation, this would calculate the actual audience size
      // based on the rules. For now, we'll return a mock response
      return NextResponse.json({
        success: true,
        data: {
          audienceSize: 150,
          sampleUserIds: ["user-1", "user-2", "user-3"] // Mock data
        }
      })
    }

    // Validate required fields for segment creation
    if (!name?.trim() || name.length < 3) {
      return NextResponse.json({
        success: false,
        error: "Segment name is required and must be at least 3 characters long"
      }, { status: 400 })
    }

    if (!rules?.groups || !Array.isArray(rules.groups)) {
      return NextResponse.json({
        success: false,
        error: "Valid segment rules are required"
      }, { status: 400 })
    }

    // Create the segment
    const segment = await prisma.segment.create({
      data: {
        name,
        rules,
        audienceUserIds: [] // Would be populated based on rules processing
      }
    })

    return NextResponse.json({
      success: true,
      message: `Segment "${name}" created successfully.`,
      data: segment
    }, { status: 201 })

  } catch (error) {
    console.error("Error creating segment:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to create segment"
    }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    // Check if we're getting a specific segment
    const url = new URL(req.url)
    const segmentId = url.pathname.split('/').pop()
    
    if (segmentId && segmentId !== 'segments') {
      const segment = await prisma.segment.findUnique({
        where: { id: segmentId }
      })

      if (!segment) {
        return NextResponse.json({
          success: false,
          error: "Segment not found"
        }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        data: segment
      })
    }

    // List all segments
    const segments = await prisma.segment.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return NextResponse.json({
      success: true,
      data: segments
    })
  } catch (error) {
    console.error("Error fetching segments:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to fetch segments"
    }, { status: 500 })
  }
} 