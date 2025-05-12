import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { RecentCampaigns } from "@/components/dashboard/recent-campaigns"
import { CampaignStatusChart } from "@/components/dashboard/customer-segments"
import { getCampaignStatusData } from "@/components/dashboard/campaign-status-data"
import { Users } from "lucide-react"
import prisma from "@/lib/prisma"

async function getTotalCustomers() {
  const count = await prisma.user.count()
  return count
}

export default async function Dashboard() {
  const totalCustomers = await getTotalCustomers()
  const campaignStatusData = await getCampaignStatusData()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome to your CRM dashboard. Here's an overview of your campaigns and customer data.
        </p>
      </div>

      <DashboardStats />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Campaigns</CardTitle>
            <CardDescription>Your most recent campaign performance</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentCampaigns />
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Campaign Status Distribution</CardTitle>
            <CardDescription>Overview of campaign statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <CampaignStatusChart data={campaignStatusData} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
