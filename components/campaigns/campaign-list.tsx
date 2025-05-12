import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Eye, BarChart3 } from "lucide-react"
import prisma from "@/lib/prisma"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

async function getCampaigns() {
  const campaigns = await prisma.campaign.findMany({
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

export async function CampaignList() {
  const campaigns = await getCampaigns()

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
            {/* <TableHead className="text-right">Actions</TableHead> */}
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((campaign) => {
            const totalSent = campaign.communicationLogs.length
            const delivered = campaign.communicationLogs.filter(log => log.status === "DELIVERED").length
            const failed = campaign.communicationLogs.filter(log => log.status === "FAILED").length

            return (
              <TableRow key={campaign.id}>
                <TableCell className="font-medium">{campaign.name}</TableCell>
                <TableCell>{formatDistanceToNow(campaign.createdAt, { addSuffix: true })}</TableCell>
                <TableCell>
                  <Badge variant={campaign.status === "SENDING" ? "outline" : "secondary"}>
                    {campaign.status}
                  </Badge>
                </TableCell>
                <TableCell>{campaign.segment.name}</TableCell>
                <TableCell className="text-right">{totalSent}</TableCell>
                <TableCell className="text-right">{delivered}</TableCell>
                <TableCell className="text-right">{failed}</TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
