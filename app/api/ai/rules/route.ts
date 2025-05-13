import { NextResponse } from "next/server";
import { generateStructuredResponse, isRuleGroup } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const { description } = await req.json();

    if (!description || typeof description !== "string") {
      return NextResponse.json(
        { error: "Description is required and must be a string" },
        { status: 400 },
      );
    }

    console.log("Converting description to rules:", description);

    const prompt = `You are a CRM rule converter. Convert this description into a rule group: "${description}"

IMPORTANT: You must return ONLY a valid JSON object matching this EXACT structure:
{
  "id": "root",
  "combinator": "AND" or "OR" (choose based on the description's logic),
  "rules": [
    {
      "id": "rule-1" (use incrementing numbers: rule-1, rule-2, etc),
      "field": MUST be one of ["spend", "visits", "inactive_days", "purchase_count", "avg_order_value"],
      "operator": MUST be one of [">", "<", ">=", "<=", "="],
      "value": MUST be a string containing only a number (e.g. "100", "30", "5000")
    }
  ]
}

Requirements:
1. Return ONLY the JSON object, no other text
2. All fields are required
3. Use ONLY the specified fields and operators
4. All "value" fields must be numeric strings
5. Generate appropriate rule IDs (rule-1, rule-2, etc)
6. Choose AND/OR combinator based on the description's logic

Example valid response:
{
  "id": "root",
  "combinator": "AND",
  "rules": [
    {
      "id": "rule-1",
      "field": "inactive_days",
      "operator": ">",
      "value": "180"
    },
    {
      "id": "rule-2",
      "field": "spend",
      "operator": ">=",
      "value": "5000"
    }
  ]
}`;

    const rules = await generateStructuredResponse(prompt, isRuleGroup);
    console.log("Generated rules:", rules);

    // Double-check the structure before sending
    if (!isRuleGroup(rules)) {
      console.error("Invalid rule structure:", rules);
      throw new Error("Generated rules do not match required structure");
    }

    return NextResponse.json(rules);
  } catch (error) {
    console.error("Error converting to rules:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to convert description to rules";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
