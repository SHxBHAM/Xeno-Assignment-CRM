import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, BarChart3, RefreshCw } from "lucide-react";
import prisma from "@/lib/prisma";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { revalidatePath } from "next/cache";

async function getCampaigns() {
  const res = await fetch("https://xeno-assignment-crm.vercel.app/api/campaigns", {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch campaigns");
  const json = await res.json();
  return json.data;
}

export async function CampaignList({ refresh }: { refresh?: boolean } = {}) {
  // If refresh is requested, revalidate the path to force fresh data
  if (refresh) {
    revalidatePath("/campaigns");
  }
  const campaigns = await getCampaigns();

  return (
    <div className="border border-zinc-800 rounded-lg bg-zinc-900">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Campaign</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Audience</TableHead>
            <TableHead className="text-right">Sent</TableHead>
            <TableHead className="text-right">Failed</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((campaign: any) => (
            <TableRow
              key={campaign.id}
              className="hover:bg-zinc-800 transition-colors"
            >
              <TableCell className="font-medium text-white">
                {campaign.name}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDistanceToNow(new Date(campaign.createdAt), {
                  addSuffix: true,
                })}
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    campaign.status === "SENDING" ? "outline" : "secondary"
                  }
                  className={
                    campaign.status === "COMPLETED"
                      ? "bg-blue-500 text-white border-none"
                      : campaign.status === "PROCESSING"
                      ? "bg-amber-500 text-white border-none"
                      : ""
                  }
                >
                  {campaign.status}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {campaign.segmentName || campaign.segment?.name || "-"}
              </TableCell>
              <TableCell className="text-right text-blue-400 font-semibold">
                {campaign.sentCount}
              </TableCell>
              <TableCell className="text-right text-red-400 font-semibold">
                {campaign.failedCount}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
