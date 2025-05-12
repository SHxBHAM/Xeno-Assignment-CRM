import { z } from "zod";
import { segmentRulesSchema } from "./segment-rules-schema"; // Import the existing segment rules schema

export const createCampaignAndSegmentSchema = z.object({
  campaignName: z
    .string()
    .min(3, "Campaign name must be at least 3 characters long."),
  message: z.string().min(10, "Message must be at least 10 characters long."),
  segmentName: z
    .string()
    .min(3, "Segment name must be at least 3 characters long."),
  segmentRules: segmentRulesSchema, // Use the imported segmentRulesSchema
});

export type CreateCampaignAndSegmentPayload = z.infer<
  typeof createCampaignAndSegmentSchema
>;
