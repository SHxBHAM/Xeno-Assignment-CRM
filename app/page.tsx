import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { RecentCampaigns } from "@/components/dashboard/recent-campaigns"
import { CustomerSegments } from "@/components/dashboard/customer-segments"

export default function Dashboard() {
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
            <CardTitle>Customer Segments</CardTitle>
            <CardDescription>Distribution of your customer segments</CardDescription>
          </CardHeader>
          <CardContent>
            <CustomerSegments />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
