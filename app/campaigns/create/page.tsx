import { CampaignCreationForm } from "@/components/campaigns/campaign-creation-form"

export default function CreateCampaignPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Campaign</h1>
        <p className="text-muted-foreground mt-2">Define your audience segment and create a new campaign</p>
      </div>

      <CampaignCreationForm />
    </div>
  )
}
