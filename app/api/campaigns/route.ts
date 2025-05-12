import { NextResponse } from "next/server"
import type { RuleGroup } from "@/components/rule-builder/rule-builder"
import prisma from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const { campaignName, message, segmentName, segmentRules } = await req.json()

    // Validate required fields
    if (!campaignName?.trim() || campaignName.length < 3) {
      return NextResponse.json(
        { 
          success: false,
          error: "Campaign name is required and must be at least 3 characters long" 
        },
        { status: 400 }
      )
    }

    if (!message?.trim() || message.length < 10) {
      return NextResponse.json(
        { 
          success: false,
          error: "Message template is required and must be at least 10 characters long" 
        },
        { status: 400 }
      )
    }

    if (!segmentName?.trim() || segmentName.length < 3) {
      return NextResponse.json(
        { 
          success: false,
          error: "Segment name is required and must be at least 3 characters long" 
        },
        { status: 400 }
      )
    }

    if (!segmentRules?.groups || !Array.isArray(segmentRules.groups)) {
      return NextResponse.json(
        { 
          success: false,
          error: "Valid segment rules are required" 
        },
        { status: 400 }
      )
    }

    // Create new segment first
    const segment = await prisma.segment.create({
      data: {
        name: segmentName,
        rules: segmentRules,
        audienceUserIds: [], // This would be populated based on rules processing
      }
    })

    // Create new campaign
    const campaign = await prisma.campaign.create({
      data: {
        name: campaignName,
        messageTemplate: message,
        status: "PROCESSING",
        audienceSize: 0, // Will be updated after processing
        sentCount: 0,
        failedCount: 0,
        segmentId: segment.id,
      },
      include: {
        segment: true
      }
    })

    return NextResponse.json({
      success: true,
      message: `Segment "${segmentName}" and Campaign "${campaignName}" created successfully. Campaign status: PROCESSING.`,
      data: {
        segment,
        campaign
      }
    }, { status: 201 })

  } catch (error) {
    console.error("Error creating campaign:", error)
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to create campaign" 
      },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  try {
    // Check if we're getting a specific campaign
    const url = new URL(req.url)
    const campaignId = url.pathname.split('/').pop()
    
    if (campaignId && campaignId !== 'campaigns') {
      const campaign = await prisma.campaign.findUnique({
        where: { id: campaignId },
        include: {
          segment: true,
          communicationLogs: {
            select: {
              status: true
            }
          }
        }
      })

      if (!campaign) {
        return NextResponse.json({
          success: false,
          error: "Campaign not found"
        }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        data: campaign
      })
    }

    // List all campaigns
    const campaigns = await prisma.campaign.findMany({
      include: {
        segment: true,
        communicationLogs: {
          select: {
            status: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return NextResponse.json({
      success: true,
      data: campaigns
    })
  } catch (error) {
    console.error("Error fetching campaigns:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to fetch campaigns"
    }, { status: 500 })
  }
} 