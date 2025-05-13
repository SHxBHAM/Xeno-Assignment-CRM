import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("Missing GEMINI_API_KEY environment variable");
}

// Initialize the API with the correct version
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Use gemini-pro instead of gemini-1.5-pro to avoid stricter rate limits
export const geminiPro = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  generationConfig: {
    temperature: 0.1, // Low temperature for more structured output
    topP: 0.1,
    topK: 16,
  },
});

// Add delay utility for rate limiting
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function generateStructuredResponse<T>(
  prompt: string,
  validate: (data: any) => data is T,
): Promise<T> {
  const maxRetries = 3;
  const baseDelay = 1000; // 1 second

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await geminiPro.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // First try to find a JSON object in the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      let parsedData: any;

      try {
        if (jsonMatch) {
          parsedData = JSON.parse(jsonMatch[0]);
        } else {
          parsedData = JSON.parse(text);
        }

        if (!validate(parsedData)) {
          console.error("Invalid response structure:", parsedData);
          throw new Error("Response does not match expected structure");
        }
        return parsedData;
      } catch (error) {
        console.error("Error parsing Gemini response:", error);
        console.error("Raw response:", text);
        throw new Error(
          error instanceof Error
            ? `Failed to parse response: ${error.message}`
            : "Failed to parse response",
        );
      }
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("429") &&
        attempt < maxRetries - 1
      ) {
        // If we hit rate limits, wait with exponential backoff
        const waitTime = baseDelay * Math.pow(2, attempt);
        console.warn(`Rate limited, retrying in ${waitTime}ms...`);
        await delay(waitTime);
        continue;
      }
      throw error;
    }
  }
  throw new Error("Max retries exceeded");
}

const VALID_FIELDS = [
  "spend",
  "visits",
  "inactive_days",
  "purchase_count",
  "avg_order_value",
] as const;
const VALID_OPERATORS = [">", "<", ">=", "<=", "="] as const;

export function isRuleGroup(data: any): data is RuleGroup {
  try {
    if (typeof data !== "object" || data === null) {
      console.error("Data is not an object:", data);
      return false;
    }

    if (typeof data.id !== "string" || data.id !== "root") {
      console.error("Invalid id:", data.id);
      return false;
    }

    if (data.combinator !== "AND" && data.combinator !== "OR") {
      console.error("Invalid combinator:", data.combinator);
      return false;
    }

    if (!Array.isArray(data.rules) || data.rules.length === 0) {
      console.error("Rules must be a non-empty array:", data.rules);
      return false;
    }

    return data.rules.every((rule: any, index: number) => {
      if (typeof rule !== "object" || rule === null) {
        console.error(`Rule ${index} is not an object:`, rule);
        return false;
      }

      if (typeof rule.id !== "string" || !rule.id.match(/^rule-\d+$/)) {
        console.error(`Invalid rule id format at index ${index}:`, rule.id);
        return false;
      }

      if (!VALID_FIELDS.includes(rule.field)) {
        console.error(`Invalid field at index ${index}:`, rule.field);
        return false;
      }

      if (!VALID_OPERATORS.includes(rule.operator)) {
        console.error(`Invalid operator at index ${index}:`, rule.operator);
        return false;
      }

      if (typeof rule.value !== "string" || !rule.value.match(/^\d+$/)) {
        console.error(`Invalid value at index ${index}:`, rule.value);
        return false;
      }

      return true;
    });
  } catch (error) {
    console.error("Error validating rule group:", error);
    return false;
  }
}

type RuleGroup = {
  id: "root";
  combinator: "AND" | "OR";
  rules: Array<{
    id: string;
    field: (typeof VALID_FIELDS)[number];
    operator: (typeof VALID_OPERATORS)[number];
    value: string;
  }>;
};
