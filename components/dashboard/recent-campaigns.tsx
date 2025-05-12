import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import prisma from "@/lib/prisma"
import { formatDistanceToNow } from "date-fns"

async function getRecentCampaigns() {
  const campaigns = await prisma.campaign.findMany({
    take: 3,
    orderBy: {
      createdAt: "desc"
    },
    include: {
      segment: true,
      communicationLogs: {
        select: {
          status: true
        }
      }
    }
  })

  return campaigns
}

export async function RecentCampaigns() {
  const campaigns = await getRecentCampaigns()

  return (
    <div className="space-y-4">
      {campaigns.map((campaign) => {
        const totalSent = campaign.communicationLogs.length
        const delivered = campaign.communicationLogs.filter(log => log.status === "DELIVERED").length
        const failed = campaign.communicationLogs.filter(log => log.status === "FAILED").length

        return (
          <div key={campaign.id} className="border border-zinc-800 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-medium">{campaign.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {formatDistanceToNow(campaign.createdAt, { addSuffix: true })}
                </p>
              </div>
              <Badge variant={campaign.status === "SENDING" ? "default" : "secondary"}>
                {campaign.status}
              </Badge>
            </div>

            <div className="space-y-2 mt-4">
              <div className="flex justify-between text-sm">
                <span>Delivery Rate</span>
                <span className="font-medium">
                  {totalSent > 0 ? Math.round((delivered / totalSent) * 100) : 0}%
                </span>
              </div>
              <Progress 
                value={totalSent > 0 ? (delivered / totalSent) * 100 : 0} 
                className="h-2" 
              />

              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Sent: {totalSent}</span>
                <span>Delivered: {delivered}</span>
                <span>Failed: {failed}</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
