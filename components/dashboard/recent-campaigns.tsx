import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import prisma from "@/lib/prisma"
import { formatDistanceToNow } from "date-fns"
import { Campaign } from "@prisma/client"

async function getRecentCampaigns(): Promise<Campaign[]> {
  return prisma.campaign.findMany({
    take: 3,
    orderBy: {
      createdAt: "desc"
    }
  })
}

export async function RecentCampaigns() {
  const campaigns = await getRecentCampaigns()

  return (
    <div className="space-y-4">
      {campaigns.map((campaign: Campaign) => (
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
              <span>Messages Sent</span>
              <span className="font-medium">
                {campaign.audienceSize > 0 
                  ? Math.round((campaign.sentCount / campaign.audienceSize) * 100) 
                  : 0}%
              </span>
            </div>
            <Progress 
              value={campaign.audienceSize > 0 
                ? (campaign.sentCount / campaign.audienceSize) * 100 
                : 0} 
              className="h-2" 
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Sent: {campaign.sentCount}</span>
              <span>Failed: {campaign.failedCount}</span>
              <span>Total: {campaign.audienceSize}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
