"use client";

import type React from "react";
import type { RuleGroup } from "@/components/rule-builder/rule-builder";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RuleBuilder } from "@/components/rule-builder/rule-builder";
// import { AudiencePreview } from "@/components/campaigns/audience-preview"
import { AIMessageSuggestions } from "@/components/ai/ai-message-suggestions";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Loader2, RotateCw } from "lucide-react";

// Map field/operator helpers outside so both functions can use
function mapField(field: string) {
  switch (field) {
    case "spend":
      return "totalSpend";
    case "inactive_days":
      return "lastOrderDate";
    case "purchase_count":
      return "orderCount";
    case "visits":
      return "orderCount";
    default:
      return field;
  }
}
function mapOperator(operator: string, field: string) {
  if (field === "inactive_days" && operator === ">") return "olderThanDays";
  switch (operator) {
    case ">":
      return "greaterThan";
    case ">=":
      return "greaterThanOrEqual";
    case "<":
      return "lessThan";
    case "<=":
      return "lessThanOrEqual";
    case "==":
      return "equals";
    case "!=":
      return "notEquals";
    default:
      return operator;
  }
}

function coerceValue(field: string, operator: string, value: any): any {
  // Numeric fields
  if (
    field === "totalSpend" ||
    field === "orderCount" ||
    (["olderThanDays", "newerThanDays"].includes(operator) &&
      (field === "lastOrderDate" || field === "userCreatedAt"))
  ) {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  }
  // Date string for onDate, beforeDate, afterDate
  if (
    (operator === "onDate" ||
      operator === "beforeDate" ||
      operator === "afterDate") &&
    (field === "lastOrderDate" || field === "userCreatedAt")
  ) {
    return String(value);
  }
  // String fields
  return String(value);
}

// Recursively flatten all rules into a single AND group for backend
function toSegmentRules(ruleBuilderOutput: any): any {
  // Helper: recursively collect all rules (leaf nodes)
  function collectAllRules(group: any): any[] {
    if (!group) return [];
    if (Array.isArray(group.rules)) {
      return group.rules.flatMap((r: any) => collectAllRules(r));
    }
    if (group.field && group.operator && group.value !== undefined) {
      return [
        {
          field: mapField(group.field),
          operator: mapOperator(group.operator, group.field),
          value: coerceValue(
            mapField(group.field),
            mapOperator(group.operator, group.field),
            group.value
          ),
        },
      ];
    }
    return [];
  }
  const allConditions = collectAllRules(ruleBuilderOutput);
  return {
    groups: allConditions.length ? [{ conditions: allConditions }] : [],
  };
}

export function CampaignCreationForm() {
  const [campaignName, setCampaignName] = useState("");
  const [message, setMessage] = useState("");
  const [audienceSize, setAudienceSize] = useState<number | null>(null);
  const [audienceLoading, setAudienceLoading] = useState(false);
  const [audienceError, setAudienceError] = useState<string | null>(null);
  const [audienceSample, setAudienceSample] = useState<string[]>([]);
  const [currentRule, setCurrentRule] = useState<RuleGroup | null>(null);
  const [naturalLanguageQuery, setNaturalLanguageQuery] = useState("");
  const [isConvertingRule, setIsConvertingRule] = useState(false);
  const [activeTab, setActiveTab] = useState<"builder" | "natural">("natural");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const updateAudienceSize = (size: number) => {
    setAudienceSize(size);
  };

  const convertToRules = async () => {
    if (!naturalLanguageQuery.trim()) {
      toast({
        title: "Error",
        description: "Please enter a description of your target audience.",
        variant: "destructive",
      });
      return;
    }

    setIsConvertingRule(true);
    try {
      const response = await fetch("/api/ai/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: naturalLanguageQuery }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to convert description");
      }

      setCurrentRule(data);
      setActiveTab("builder");

      toast({
        title: "Success",
        description: "Successfully converted your description to rules.",
      });
    } catch (error) {
      console.error("Error converting to rules:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to convert your description to rules. Please try again or use the rule builder.",
        variant: "destructive",
      });
    } finally {
      setIsConvertingRule(false);
    }
  };

  async function checkAudienceSize() {
    if (!currentRule) {
      setAudienceError("Please define audience rules first.");
      return;
    }
    setAudienceLoading(true);
    setAudienceError(null);
    setAudienceSample([]);
    setAudienceSize(null);
    try {
      const response = await fetch("/api/segments/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toSegmentRules(currentRule)), // <-- send rules object directly
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to preview audience");
      setAudienceSize(data.data.audienceSize);
      setAudienceSample(data.data.sampleUserIds || []);
    } catch (e: any) {
      setAudienceError(e.message || "Failed to preview audience");
    } finally {
      setAudienceLoading(false);
    }
  }

  useEffect(() => {
    if (currentRule) {
      checkAudienceSize();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRule]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all required fields
    const errors: string[] = [];

    if (!campaignName.trim()) {
      errors.push("Campaign name is required");
    }

    if (!message.trim()) {
      errors.push("Message content is required");
    }

    if (!currentRule) {
      errors.push("Audience targeting rules are required");
    }

    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: (
          <ul className="list-disc pl-4">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        ),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignName: campaignName.trim(),
          message: message.trim(),
          segmentName: campaignName.trim(), // Using campaign name as segment name; change if you want a separate field
          segmentRules: toSegmentRules(currentRule),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create campaign");
      }

      toast({
        title: "Success",
        description: "Campaign created successfully",
      });

      router.push("/campaigns");
    } catch (error) {
      console.error("Error creating campaign:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to create campaign. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle>Campaign Details</CardTitle>
          <CardDescription>
            Enter the basic information for your campaign
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            <Label htmlFor="name">Campaign Name</Label>
            <Input
              id="name"
              placeholder="Enter campaign name"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-500"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle>Define Audience</CardTitle>
          <CardDescription>
            Create rules to target specific customer segments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={(value) =>
              setActiveTab(value as "builder" | "natural")
            }
          >
            <TabsList className="mb-4">
              <TabsTrigger value="builder">Rule Builder</TabsTrigger>
              <TabsTrigger value="natural">Natural Language</TabsTrigger>
            </TabsList>
            <TabsContent value="builder">
              <RuleBuilder
                onUpdate={updateAudienceSize}
                onRuleChange={setCurrentRule}
                initialRules={currentRule}
              />
            </TabsContent>
            <TabsContent value="natural">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="natural-language">
                    Describe your audience
                  </Label>
                  <Textarea
                    id="natural-language"
                    placeholder="E.g., People who haven't shopped in 6 months and spent over ₹5K"
                    className="min-h-[100px] bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-500"
                    value={naturalLanguageQuery}
                    onChange={(e) => setNaturalLanguageQuery(e.target.value)}
                  />
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={convertToRules}
                  disabled={isConvertingRule}
                >
                  {isConvertingRule ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      Converting...
                    </>
                  ) : (
                    "Convert to Rules"
                  )}
                </Button>
                {currentRule && (
                  <p className="text-sm text-muted-foreground mt-4">
                    Note: Your rules have been created and are available in the
                    Rule Builder tab.
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6">
            {/* <AudiencePreview audienceSize={audienceSize} /> */}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle>Message Content</CardTitle>
          <CardDescription>
            Create the message that will be sent to your audience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Enter your message content"
              className="min-h-[120px] bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-500"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <AIMessageSuggestions onSelectMessage={setMessage} />
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle>Review & Create</CardTitle>
          <CardDescription>
            Review your campaign details before creating
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 items-center">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Campaign Name
                </h3>
                <p>{campaignName || "Not specified"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  Audience Size
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={checkAudienceSize}
                    disabled={audienceLoading || !currentRule}
                    className="ml-1"
                    aria-label="Check audience size"
                  >
                    <RotateCw
                      className={audienceLoading ? "animate-spin" : ""}
                      size={16}
                    />
                  </Button>
                </h3>
                <p>
                  {audienceLoading && "Checking..."}
                  {!audienceLoading && audienceSize !== null && (
                    <span>{audienceSize.toLocaleString()} customers</span>
                  )}
                  {!audienceLoading && audienceError && (
                    <span className="text-red-500">{audienceError}</span>
                  )}
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Message Preview
              </h3>
              <div className="mt-2 p-3 border border-zinc-800 rounded-md">
                {message || "No message content"}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="ml-auto" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Campaign"
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
