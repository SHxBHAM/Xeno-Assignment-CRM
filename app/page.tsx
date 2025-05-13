import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { RecentCampaigns } from "@/components/dashboard/recent-campaigns";
import { CampaignStatusChart } from "@/components/dashboard/customer-segments";
import { getCampaignStatusData } from "@/components/dashboard/campaign-status-data";
import { Users } from "lucide-react";
import prisma from "@/lib/prisma";
import { Suspense } from "react";

async function getTotalCustomers() {
  const count = await prisma.user.count();
  return count;
}

export default async function Dashboard() {
  const totalCustomers = await getTotalCustomers();
  const campaignStatusData = await getCampaignStatusData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome to your CRM dashboard. Here's an overview of your campaigns
          and customer data.
        </p>
      </div>
      <Suspense fallback={<DashboardSkeleton />}>
        {" "}
        {/* Unified skeleton for all dashboard widgets */}
        <DashboardStats />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Recent Campaigns</CardTitle>
              <CardDescription>
                Your most recent campaign performance
              </CardDescription>
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
      </Suspense>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 animate-pulse space-y-4"
          >
            <div className="h-4 w-1/3 mb-2 bg-zinc-800 rounded" />
            <div className="h-8 w-1/2 bg-zinc-800 rounded" />
            <div className="h-3 w-1/4 bg-zinc-800 rounded" />
          </div>
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <div className="p-6 border border-zinc-800 rounded-lg bg-zinc-900 animate-pulse space-y-4">
            <div className="h-5 w-40 mb-2 bg-zinc-800 rounded" />
            <div className="h-4 w-24 bg-zinc-800 rounded" />
            <div className="h-4 w-1/2 bg-zinc-800 rounded" />
            <div className="h-2 w-full rounded bg-zinc-800" />
            <div className="flex gap-2 mt-2">
              <div className="h-4 w-16 bg-zinc-800 rounded" />
              <div className="h-4 w-16 bg-zinc-800 rounded" />
              <div className="h-4 w-16 bg-zinc-800 rounded" />
              <div className="h-4 w-16 bg-zinc-800 rounded" />
            </div>
          </div>
        </div>
        <div className="col-span-3">
          <div className="p-6 border border-zinc-800 rounded-lg bg-zinc-900 animate-pulse space-y-4">
            <div className="h-5 w-40 mb-2 bg-zinc-800 rounded" />
            <div className="h-4 w-24 bg-zinc-800 rounded" />
            <div className="h-32 w-full bg-zinc-800 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
