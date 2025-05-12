import prisma from "@/lib/prisma"

const STATUS_COLORS = {
  DRAFT: "#e5e7eb",      // Gray 200
  SENDING: "#f9fafb",    // Gray 50
  COMPLETED: "#ffffff",  // White
  FAILED: "#d1d5db",     // Gray 300
  PROCESSING: "#f3f4f6"  // Gray 100
}

export async function getCampaignStatusData() {
  const campaigns = await prisma.campaign.groupBy({
    by: ['status'],
    _count: {
      status: true
    }
  })

  return campaigns.map(item => ({
    name: item.status,
    value: item._count.status,
    color: STATUS_COLORS[item.status]
  }))
} 