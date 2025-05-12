import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export function RecentCampaigns() {
  const campaigns = [
    {
      id: 1,
      name: "Spring Sale Promotion",
      date: "May 10, 2025",
      status: "Active",
      sent: 2450,
      delivered: 2300,
      failed: 150,
      audience: 2500,
    },
    {
      id: 2,
      name: "Inactive Customer Win-back",
      date: "May 5, 2025",
      status: "Completed",
      sent: 1200,
      delivered: 1150,
      failed: 50,
      audience: 1200,
    },
    {
      id: 3,
      name: "New Product Launch",
      date: "Apr 28, 2025",
      status: "Completed",
      sent: 5000,
      delivered: 4850,
      failed: 150,
      audience: 5000,
    },
  ]

  return (
    <div className="space-y-4">
      {campaigns.map((campaign) => (
        <div key={campaign.id} className="border border-zinc-800 rounded-lg p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-medium">{campaign.name}</h3>
              <p className="text-sm text-muted-foreground">{campaign.date}</p>
            </div>
            <Badge variant={campaign.status === "Active" ? "default" : "secondary"}>{campaign.status}</Badge>
          </div>

          <div className="space-y-2 mt-4">
            <div className="flex justify-between text-sm">
              <span>Delivery Rate</span>
              <span className="font-medium">{Math.round((campaign.delivered / campaign.sent) * 100)}%</span>
            </div>
            <Progress value={(campaign.delivered / campaign.sent) * 100} className="h-2" />

            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Sent: {campaign.sent}</span>
              <span>Delivered: {campaign.delivered}</span>
              <span>Failed: {campaign.failed}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
