import { NextResponse } from "next/server"
import type { RuleGroup } from "@/components/rule-builder/rule-builder"

type Campaign = {
  id: string
  name: string
  message: string
  rules: RuleGroup
  audienceSize: number
  createdAt: string
}

// In-memory storage for campaigns (replace with database in production)
let campaigns: Campaign[] = []

export async function POST(req: Request) {
  try {
    const { name, message, rules, audienceSize } = await req.json()

    // Validate required fields
    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Campaign name is required" },
        { status: 400 }
      )
    }

    if (!message?.trim()) {
      return NextResponse.json(
        { error: "Message content is required" },
        { status: 400 }
      )
    }

    if (!rules || !rules.id || !Array.isArray(rules.rules)) {
      return NextResponse.json(
        { error: "Valid targeting rules are required" },
        { status: 400 }
      )
    }

    // Create new campaign
    const newCampaign: Campaign = {
      id: `campaign-${Date.now()}`,
      name,
      message,
      rules,
      audienceSize,
      createdAt: new Date().toISOString()
    }

    // Save campaign (in memory for now)
    campaigns.push(newCampaign)

    return NextResponse.json(newCampaign)
  } catch (error) {
    console.error("Error creating campaign:", error)
    return NextResponse.json(
      { error: "Failed to create campaign" },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(campaigns)
} 