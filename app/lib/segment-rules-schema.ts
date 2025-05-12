// Suggested filepath: app/lib/segment-rules-schema.ts
import { z } from "zod";

export const conditionSchema = z.object({
  field: z.enum([
    "totalSpend", // Aggregated from Order.totalAmount
    "orderCount", // Count of Orders for a User
    "lastOrderDate", // Most recent Order.createdAt for a User
    "userCreatedAt", // User.createdAt
    "email", // User.email
    "name", // User.name
    "city", // User.address.city
    "state", // User.address.state
    "country", // User.address.country
    // Add other filterable fields as needed
  ]),
  operator: z.enum([
    "equals",
    "notEquals",
    "greaterThan",
    "lessThan",
    "greaterThanOrEqual",
    "lessThanOrEqual",
    "contains", // For string fields
    "notContains", // For string fields
    "startsWith", // For string fields
    "endsWith", // For string fields
    "olderThanDays", // For date fields (value is number of days)
    "newerThanDays", // For date fields (value is number of days)
    "onDate", // For date fields (value is ISO date string)
    "beforeDate", // For date fields (value is ISO date string)
    "afterDate", // For date fields (value is ISO date string)
    "isEmpty", // For optional fields or empty strings/arrays
    "isNotEmpty", // For optional fields or non-empty strings/arrays
  ]),
  value: z.any(), // Value type depends on field and operator.
  // Will need careful handling or further refinement with .refine() or discriminated unions
  // e.g., if operator is 'olderThanDays', value should be number.
  // if field is 'totalSpend', value should be number.
  // if field is 'email', value should be string.
});

export const conditionGroupSchema = z.object({
  // logicalOperator: z.enum(["AND"]), // Implicitly AND between conditions in a group
  conditions: z
    .array(conditionSchema)
    .min(1, "A group must have at least one condition."),
});

export const segmentRulesSchema = z.object({
  // logicalOperator: z.enum(["OR"]), // Implicitly OR between groups
  groups: z
    .array(conditionGroupSchema)
    .min(1, "Rules must have at least one group of conditions."),
});

// For more type safety, you can define specific types for values based on field/operator
// This is an advanced step using discriminated unions or refine, but good for robustness.
// For now, `z.any()` allows flexibility but requires careful handling in the logic.

export type SegmentRules = z.infer<typeof segmentRulesSchema>;
export type Condition = z.infer<typeof conditionSchema>;
export type ConditionGroup = z.infer<typeof conditionGroupSchema>;

/*
// Example of how you might start refining the value type (can be complex)
const refinedConditionSchema = z.discriminatedUnion("field", [
  z.object({ field: z.literal("totalSpend"), operator: z.enum([...numberOperators]), value: z.number() }),
  z.object({ field: z.literal("orderCount"), operator: z.enum([...numberOperators]), value: z.number() }),
  z.object({ field: z.literal("lastOrderDate"), operator: z.enum([...dateOperators]), value: z.union([z.string().datetime(), z.number()]) }), // number for olderThanDays/newerThanDays
  z.object({ field: z.literal("email"), operator: z.enum([...stringOperators]), value: z.string() }),
  // ... and so on for all fields
]);
// This requires defining stringOperators, numberOperators, dateOperators arrays.
*/

export const createSegmentSchema = z.object({
  name: z.string().min(3, "Segment name must be at least 3 characters long."),
  rules: segmentRulesSchema, // Reusing the existing rules schema
});

export type CreateSegmentPayload = z.infer<typeof createSegmentSchema>;
