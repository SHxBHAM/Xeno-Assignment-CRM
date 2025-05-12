import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, Users, Send, Zap } from "lucide-react"
import prisma from "@/lib/prisma"

async function getTotalCustomers() {
  const count = await prisma.user.count()
  return count
}

async function getTotalCampaigns() {
  const count = await prisma.campaign.count()
  return count
}
async function getTotalSales() {
  const count = await prisma.order.count()
  return count
}
async function getTotalSegments() {
  const count = await prisma.segment.count()
  return count
}

export async function DashboardStats() {
  const totalCustomers = await getTotalCustomers()
  const totalCampaigns = await getTotalCampaigns()
  const totalSales = await getTotalSales()
  const totalSegments = await getTotalSegments()
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCustomers.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Total registered users</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
          <Send className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCampaigns.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Total campaign runs till now</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalSales.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Total sales till now</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Customer Segments</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalSegments.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Total segments</p>
        </CardContent>
      </Card>
    </div>
  )
}
