import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=`;

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { toolName, inputs, calculationResult } = body;

  // If no API key, return a hint to use algorithmic fallback
  if (!GEMINI_API_KEY) {
    return NextResponse.json({
      recommendations: [],
      analysisNotes: "AI enhancement unavailable. Using smart algorithmic analysis.",
    });
  }

  try {
    const prompt = `You are a certified financial planner AI assistant. Analyze the following financial calculation and provide personalized, actionable recommendations.

Tool: ${toolName}
User Inputs: ${JSON.stringify(inputs, null, 2)}
Calculation Result: ${JSON.stringify(calculationResult, null, 2)}

Provide 3-5 specific, personalized recommendations in this EXACT JSON format (no markdown, no code fences):
{
  "recommendations": [
    {
      "title": "Short title",
      "description": "2-3 sentences with specific numbers from the user's data",
      "priority": "high|medium|low",
      "reasoning": "1 sentence explaining WHY this recommendation makes sense for this specific user"
    }
  ],
  "enhancedSummary": "One sentence enhancing the calculation summary with insight",
  "analysisNotes": "Brief note about the analysis"
}

Rules:
- Use the user's ACTUAL numbers in recommendations (not generic examples)
- Be specific and actionable, not generic advice
- Explain WHY each recommendation fits THIS user's situation
- Consider the user's risk level, timeline, and goals
- Do not repeat advice already in the calculation warnings
- Keep descriptions under 100 words each`;

    const response = await fetch(`${GEMINI_URL}${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!response.ok) {
      return NextResponse.json({
        recommendations: [],
        analysisNotes: "AI service temporarily unavailable.",
      });
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Extract JSON from response (may have code fences)
    let jsonStr = text;
    const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenceMatch) {
      jsonStr = fenceMatch[1];
    }

    try {
      const parsed = JSON.parse(jsonStr);
      return NextResponse.json(parsed);
    } catch {
      return NextResponse.json({
        recommendations: [],
        analysisNotes: "AI response could not be parsed. Using algorithmic analysis.",
      });
    }
  } catch (error) {
    console.error("AI API error:", error);
    return NextResponse.json({
      recommendations: [],
      analysisNotes: "AI service error. Using algorithmic analysis.",
    });
  }
}
