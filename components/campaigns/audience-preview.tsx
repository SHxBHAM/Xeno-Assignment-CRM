import { Card, CardContent } from "@/components/ui/card"
import { Users } from "lucide-react"

export function AudiencePreview({ audienceSize }: { audienceSize: number }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="bg-zinc-800 p-2 rounded-full">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-medium">Audience Preview</h3>
            <p className="text-sm text-muted-foreground">Your segment will target approximately</p>
            <p className="text-2xl font-bold mt-1">{audienceSize.toLocaleString()} customers</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
