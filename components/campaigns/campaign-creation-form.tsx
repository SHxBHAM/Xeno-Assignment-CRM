"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RuleBuilder } from "@/components/rule-builder/rule-builder"
import { AudiencePreview } from "@/components/campaigns/audience-preview"
import { AIMessageSuggestions } from "@/components/ai/ai-message-suggestions"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export function CampaignCreationForm() {
  const [campaignName, setCampaignName] = useState("")
  const [campaignDescription, setCampaignDescription] = useState("")
  const [message, setMessage] = useState("")
  const [audienceSize, setAudienceSize] = useState(0)
  const { toast } = useToast()
  const router = useRouter()

  // Simulate audience calculation based on rules
  const updateAudienceSize = (size: number) => {
    setAudienceSize(size)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!campaignName || !message) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    // Simulate campaign creation
    toast({
      title: "Campaign created",
      description: "Your campaign has been created and is being processed",
    })

    // Redirect to campaigns page
    setTimeout(() => {
      router.push("/campaigns")
    }, 1500)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Campaign Details</CardTitle>
            <CardDescription>Enter the basic information about your campaign</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Campaign Name</Label>
              <Input
                id="name"
                placeholder="Enter campaign name"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Enter campaign description"
                value={campaignDescription}
                onChange={(e) => setCampaignDescription(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Define Audience</CardTitle>
            <CardDescription>Create rules to target specific customer segments</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="builder">
              <TabsList className="mb-4">
                <TabsTrigger value="builder">Rule Builder</TabsTrigger>
                <TabsTrigger value="natural">Natural Language</TabsTrigger>
              </TabsList>
              <TabsContent value="builder">
                <RuleBuilder onUpdate={updateAudienceSize} />
              </TabsContent>
              <TabsContent value="natural">
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="natural-language">Describe your audience</Label>
                    <Textarea
                      id="natural-language"
                      placeholder="E.g., People who haven't shopped in 6 months and spent over ₹5K"
                      className="min-h-[100px]"
                    />
                  </div>
                  <Button variant="secondary">Convert to Rules</Button>
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-6">
              <AudiencePreview audienceSize={audienceSize} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Message Content</CardTitle>
            <CardDescription>Create the message that will be sent to your audience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Enter your message content"
                className="min-h-[120px]"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            <AIMessageSuggestions onSelectMessage={setMessage} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Review & Create</CardTitle>
            <CardDescription>Review your campaign details before creating</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Campaign Name</h3>
                  <p>{campaignName || "Not specified"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Audience Size</h3>
                  <p>{audienceSize.toLocaleString()} customers</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Message Preview</h3>
                <div className="mt-2 p-3 border border-zinc-800 rounded-md">{message || "No message content"}</div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button">
              Cancel
            </Button>
            <Button type="submit">Create Campaign</Button>
          </CardFooter>
        </Card>
      </div>
    </form>
  )
}
