"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, RefreshCw } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

type MessageSuggestion = {
  id: string;
  content: string;
  tone: string;
};

const TONES = [
  { value: "friendly", label: "Friendly" },
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual" },
  { value: "urgent", label: "Urgent" },
  { value: "formal", label: "Formal" },
  { value: "enthusiastic", label: "Enthusiastic" },
];

export function AIMessageSuggestions({
  onSelectMessage,
}: {
  onSelectMessage: (message: string) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [objective, setObjective] = useState("win-back");
  const [selectedTone, setSelectedTone] = useState("friendly");
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
  ]);

  const generateSuggestions = async () => {
    setIsLoading(true);
    try {
      const contexts = {
        "win-back": "Customer has not made a purchase in the last 6 months",
        promotion: "New seasonal collection launch with special discounts",
        loyalty: "Customer has made more than 5 purchases in the last 3 months",
      };

      const responses = await Promise.all(
        [1, 2, 3].map(async () => {
          const response = await fetch("/api/ai/message", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              objective,
              tone: selectedTone,
              context: contexts[objective as keyof typeof contexts],
            }),
          });

          if (!response.ok) throw new Error("Failed to generate message");
          const data = await response.json();
          return data.message;
        })
      );

      const newSuggestions = responses.map((content, index) => ({
        id: `gen-${index + 1}`,
        content,
        tone: selectedTone,
      }));

      setSuggestions(newSuggestions);
    } catch (error) {
      console.error("Error generating suggestions:", error);
      toast({
        title: "Error",
        description:
          "Failed to generate message suggestions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="p-4 border border-zinc-800 rounded-lg bg-zinc-900 animate-pulse space-y-2"
          >
            <Skeleton className="h-4 w-1/2 mb-2" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-8 w-full" />
          </div>
        ))}
      </div>
    );
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
          <Select value={selectedTone} onValueChange={setSelectedTone}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TONES.map((tone) => (
                <SelectItem key={tone.value} value={tone.value}>
                  {tone.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={generateSuggestions}
            disabled={isLoading}
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-1" />
            )}
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
                  <span className="text-xs font-medium text-muted-foreground">
                    Tone: {suggestion.tone}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    onClick={() => onSelectMessage(suggestion.content)}
                  >
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
  );
}
