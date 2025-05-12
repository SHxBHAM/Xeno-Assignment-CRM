import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"
import { CampaignList } from "@/components/campaigns/campaign-list"

export default function CampaignsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
          <p className="text-muted-foreground mt-2">View and manage your marketing campaigns</p>
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
  )
}
