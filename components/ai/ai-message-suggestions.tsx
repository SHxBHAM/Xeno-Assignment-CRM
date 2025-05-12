"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, RefreshCw } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type MessageSuggestion = {
  id: string
  content: string
  tone: string
}

export function AIMessageSuggestions({ onSelectMessage }: { onSelectMessage: (message: string) => void }) {
  const [isLoading, setIsLoading] = useState(false)
  const [objective, setObjective] = useState("win-back")
  const [suggestions, setSuggestions] = useState<MessageSuggestion[]>([
    {
      id: "1",
      content:
        "Hi {name}, we've missed you! It's been a while since your last purchase. Come back and enjoy 10% off your next order with code WELCOME10.",
      tone: "friendly",
    },
    {
      id: "2",
      content:
        "Dear {name}, as a valued customer, we'd like to invite you back with an exclusive offer: 15% off your next purchase. We hope to see you soon!",
      tone: "professional",
    },
    {
      id: "3",
      content:
        "{name}! 🎉 Long time no see! We've got some amazing new products we think you'll love. Use COMEBACK15 for 15% off your next order!",
      tone: "casual",
    },
  ])

  const generateSuggestions = () => {
    setIsLoading(true)

    // Simulate API call to AI service
    setTimeout(() => {
      const newSuggestions: MessageSuggestion[] = []

      if (objective === "win-back") {
        newSuggestions.push(
          {
            id: "4",
            content:
              "Hi {name}, we noticed you haven't shopped with us recently. We've added new items to our collection that match your style. Use code RETURN20 for 20% off!",
            tone: "personalized",
          },
          {
            id: "5",
            content:
              "Hello {name}, it's been a while! We value your business and would love to welcome you back with a special discount of 15% on your next purchase.",
            tone: "warm",
          },
          {
            id: "6",
            content:
              "{name}, we miss you! 😢 Come back and shop with us - we've got a special 10% discount waiting just for you with code MISSYOU10.",
            tone: "emotional",
          },
        )
      } else if (objective === "promotion") {
        newSuggestions.push(
          {
            id: "4",
            content:
              "Hi {name}! Our biggest sale of the season is here! Enjoy up to 50% off on selected items for a limited time only.",
            tone: "exciting",
          },
          {
            id: "5",
            content:
              "Dear {name}, we're excited to announce our Spring Collection is now available with special introductory prices for our valued customers.",
            tone: "professional",
          },
          {
            id: "6",
            content:
              "{name}! 🔥 FLASH SALE ALERT! 24 hours only - get 30% off everything with code FLASH30. Don't miss out!",
            tone: "urgent",
          },
        )
      } else {
        newSuggestions.push(
          {
            id: "4",
            content:
              "Hi {name}, thank you for being a loyal customer! As a token of our appreciation, enjoy a complimentary gift with your next purchase.",
            tone: "grateful",
          },
          {
            id: "5",
            content:
              "Dear {name}, we value your loyalty. To show our appreciation, we're offering you exclusive early access to our new collection before anyone else.",
            tone: "exclusive",
          },
          {
            id: "6",
            content:
              "{name}, you're one of our VIPs! 🌟 Enjoy a special 20% discount on your next order as a thank you for your continued support.",
            tone: "celebratory",
          },
        )
      }

      setSuggestions(newSuggestions)
      setIsLoading(false)
    }, 1500)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">AI Message Suggestions</h3>
        <div className="flex items-center gap-2">
          <Select value={objective} onValueChange={setObjective}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="win-back">Win-back Inactive Users</SelectItem>
              <SelectItem value="promotion">Promote New Products</SelectItem>
              <SelectItem value="loyalty">Reward Loyal Customers</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={generateSuggestions} disabled={isLoading}>
            {isLoading ? <RefreshCw className="h-4 w-4 mr-1 animate-spin" /> : <Sparkles className="h-4 w-4 mr-1" />}
            Generate
          </Button>
        </div>
      </div>

      <div className="grid gap-3">
        {suggestions.map((suggestion) => (
          <Card key={suggestion.id} className="overflow-hidden border-zinc-800">
            <CardContent className="p-0">
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground">Tone: {suggestion.tone}</span>
                  <Button variant="ghost" size="sm" onClick={() => onSelectMessage(suggestion.content)}>
                    Use this
                  </Button>
                </div>
                <p className="text-sm">{suggestion.content}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
