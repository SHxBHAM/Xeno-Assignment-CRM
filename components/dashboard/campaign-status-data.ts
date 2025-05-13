import { CampaignStatus } from "@prisma/client";
import prisma from "@/lib/prisma";

type CampaignStatusCount = {
  name: CampaignStatus;
  value: number;
  color: string;
};

const STATUS_COLORS: Record<CampaignStatus, string> = {
  PROCESSING: "#f6b21b", // mid yellow
  COMPLETED: "#5393e3", // mid blue
};

export async function getCampaignStatusData(): Promise<CampaignStatusCount[]> {
  const campaigns = await prisma.campaign.groupBy({
    by: ["status"],
    _count: {
      status: true,
    },
  });

  return campaigns.map((item) => ({
    name: item.status,
    value: item._count.status,
    color: STATUS_COLORS[item.status],
  }));
}
