"use client";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useState } from "react";

const STATUS_COLORS = {
  PROCESSING: "#f6b21b", // old: #f59e0b, pastel: #fbbf24, mid: #f6b21b
  COMPLETED: "#5393e3", // old: #3b82f6, pastel: #60a5fa, mid: #5393e3
  SENT: "#60a5fa", // old: #3b82f6, pastel: #93c5fd, mid: #60a5fa
  DELIVERED: "#34d399", // old: #22c55e, pastel: #6ee7b7, mid: #34d399
  FAILED: "#f87171", // old: #ef4444, pastel: #fca5a5, mid: #f87171
  PENDING: "#facc15", // old: #f59e0b, pastel: #fde68a, mid: #facc15
};

function getStatusBarSegments(campaign: any) {
  const total = campaign.audienceSize || 1;
  // Calculate pending as total - (sent + failed)
  const sent = campaign.sentCount || 0;
  const failed = campaign.failedCount || 0;
  const delivered = campaign.deliveredCount || 0;
  const pending = Math.max(total - (sent + failed), 0);
  return [
    { label: "Delivered", value: delivered, color: STATUS_COLORS.DELIVERED },
    { label: "Sent", value: sent, color: STATUS_COLORS.SENT },
    { label: "Failed", value: failed, color: STATUS_COLORS.FAILED },
    { label: "Pending", value: pending, color: STATUS_COLORS.PENDING },
  ]
    .filter((seg) => seg.value > 0)
    .map((seg) => ({ ...seg, percent: Math.round((seg.value / total) * 100) }));
}

export function RecentCampaigns() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCampaigns() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/campaigns?limit=3", {
          cache: "no-store",
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error || "Unknown error");
        setCampaigns(json.data.slice(0, 3));
      } catch (e: any) {
        setError(e.message || "Failed to load recent campaigns");
      } finally {
        setLoading(false);
      }
    }
    fetchCampaigns();
  }, []);

  if (loading)
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="border border-zinc-800 rounded-lg p-4 animate-pulse"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <Skeleton className="h-5 w-40 mb-2" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <div className="space-y-2 mt-4">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-2 w-full rounded" />
              <div className="flex gap-2 mt-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  if (error) return <div className="text-red-500">{error}</div>;
  if (!campaigns.length) return <div>No recent campaigns found.</div>;

  return (
    <div className="space-y-4">
      {campaigns.map((campaign) => {
        const total = campaign.audienceSize || 1;
        const segments = getStatusBarSegments(campaign);
        return (
          <div
            key={campaign.id}
            className="border border-zinc-800 rounded-lg p-4"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-medium">{campaign.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(campaign.createdAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
              <Badge
                variant={
                  campaign.status === "SENDING" ? "default" : "secondary"
                }
              >
                {campaign.status}
              </Badge>
            </div>
            <div className="space-y-2 mt-4">
              <div className="flex justify-between text-sm">
                <span>Delivery Breakdown</span>
                <span className="font-medium">
                  {total > 0
                    ? Math.round(
                        ((campaign.deliveredCount + campaign.sentCount) /
                          total) *
                          100
                      )
                    : 0}
                  %
                </span>
              </div>
              <div className="flex w-full h-2 rounded overflow-hidden bg-zinc-800">
                {segments.map((seg) => (
                  <div
                    key={seg.label}
                    style={{ width: `${seg.percent}%`, background: seg.color }}
                    className="h-2"
                    title={`${seg.label}: ${seg.value}`}
                  />
                ))}
              </div>
              <div className="flex flex-wrap gap-2 mt-2 text-xs text-muted-foreground">
                <span>
                  Delivered:{" "}
                  <span className="font-semibold text-green-400">
                    {campaign.deliveredCount}
                  </span>
                </span>
                <span>
                  Sent:{" "}
                  <span className="font-semibold text-blue-400">
                    {campaign.sentCount}
                  </span>
                </span>
                <span>
                  Failed:{" "}
                  <span className="font-semibold text-red-400">
                    {campaign.failedCount}
                  </span>
                </span>
                <span>
                  Pending:{" "}
                  <span className="font-semibold text-yellow-400">
                    {Math.max(
                      (campaign.audienceSize || 0) -
                        (campaign.sentCount || 0) -
                        (campaign.failedCount || 0),
                      0
                    )}
                  </span>
                </span>
                <span>
                  Total:{" "}
                  <span className="font-semibold">{campaign.audienceSize}</span>
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
