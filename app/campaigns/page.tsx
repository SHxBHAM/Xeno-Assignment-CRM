import { Button } from "@/components/ui/button";
import { PlusCircle, RefreshCw } from "lucide-react";
import Link from "next/link";
import { CampaignList } from "@/components/campaigns/campaign-list";

export default function CampaignsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
          <form method="GET" action="/campaigns">
            <button
              type="submit"
              className="p-1 rounded hover:bg-zinc-800"
              title="Refresh"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
          </form>
        </div>
        <Link href="/campaigns/create">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Campaign
          </Button>
        </Link>
      </div>

      <CampaignList />
    </div>
  );
}
