import { NextResponse } from "next/server";
import { geminiPro } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const { objective, tone, context } = await req.json();

    const prompt = `Generate a marketing message for a CRM campaign with the following parameters:
Objective: ${objective}
Tone: ${tone}
Context: ${context}

The message should:
1. Be personalized (use {name} for customer name)
2. Be concise and engaging
3. Include a clear call to action
4. Match the specified tone
5. Be relevant to the objective

Generate the message in a natural, conversational style.`;

    const result = await geminiPro.generateContent(prompt);
    const response = await result.response;
    const message = response.text();

    return NextResponse.json({ message });
  } catch (error) {
    console.error("Error generating message:", error);
    return NextResponse.json(
      { error: "Failed to generate message" },
      { status: 500 },
    );
  }
}
