import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Eye, BarChart3 } from "lucide-react"

export function CampaignList() {
  const campaigns = [
    {
      id: 1,
      name: "Spring Sale Promotion",
      date: "May 10, 2025",
      status: "Active",
      audience: "High Value Customers",
      sent: 2450,
      delivered: 2300,
      failed: 150,
    },
    {
      id: 2,
      name: "Inactive Customer Win-back",
      date: "May 5, 2025",
      status: "Completed",
      audience: "Inactive > 90 days",
      sent: 1200,
      delivered: 1150,
      failed: 50,
    },
    {
      id: 3,
      name: "New Product Launch",
      date: "Apr 28, 2025",
      status: "Completed",
      audience: "All Customers",
      sent: 5000,
      delivered: 4850,
      failed: 150,
    },
    {
      id: 4,
      name: "Loyalty Program",
      date: "Apr 15, 2025",
      status: "Completed",
      audience: "Repeat Customers",
      sent: 3200,
      delivered: 3100,
      failed: 100,
    },
    {
      id: 5,
      name: "Feedback Survey",
      date: "Apr 1, 2025",
      status: "Completed",
      audience: "Recent Purchasers",
      sent: 1800,
      delivered: 1750,
      failed: 50,
    },
  ]

  return (
    <div className="border border-zinc-800 rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Campaign</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Audience</TableHead>
            <TableHead className="text-right">Sent</TableHead>
            <TableHead className="text-right">Delivered</TableHead>
            <TableHead className="text-right">Failed</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((campaign) => (
            <TableRow key={campaign.id}>
              <TableCell className="font-medium">{campaign.name}</TableCell>
              <TableCell>{campaign.date}</TableCell>
              <TableCell>
                <Badge variant={campaign.status === "Active" ? "outline" : "secondary"}>{campaign.status}</Badge>
              </TableCell>
              <TableCell>{campaign.audience}</TableCell>
              <TableCell className="text-right">{campaign.sent}</TableCell>
              <TableCell className="text-right">{campaign.delivered}</TableCell>
              <TableCell className="text-right">{campaign.failed}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
