import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

interface GeminiCandidate {
  content?: { parts?: { text?: string }[] };
}

async function callGemini(modelUrl: string, apiKey: string, prompt: string): Promise<{ ok: boolean; status: number; data: { candidates?: GeminiCandidate[] } | null }> {
  try {
    const response = await fetch(`${modelUrl}${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error(`Gemini API error (${response.status}):`, errBody);
      return { ok: false, status: response.status, data: null };
    }

    const data = await response.json();
    return { ok: true, status: 200, data };
  } catch (err) {
    console.error("Gemini fetch error:", err);
    return { ok: false, status: 500, data: null };
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { toolName, inputs, calculationResult } = body;

  // If no API key, return algorithmic fallback hint
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

    // Try models in order — current free tier models as of June 2026
    const modelUrls = [
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=",
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=",
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash:generateContent?key=",
    ];

    let geminiData: { candidates?: GeminiCandidate[] } | null = null;

    for (const url of modelUrls) {
      const result = await callGemini(url, GEMINI_API_KEY, prompt);
      if (result.ok && result.data) {
        geminiData = result.data;
        break;
      }
      // If not a 404 (model not found), don't try next model
      if (result.status !== 404) {
        return NextResponse.json({
          recommendations: [],
          analysisNotes: `AI service error (${result.status}). Using algorithmic analysis.`,
        });
      }
    }

    if (!geminiData) {
      return NextResponse.json({
        recommendations: [],
        analysisNotes: "AI models unavailable. Using algorithmic analysis.",
      });
    }

    const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";

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
      // If JSON parsing fails, return the raw text as analysis notes
      return NextResponse.json({
        recommendations: [],
        enhancedSummary: text.slice(0, 200),
        analysisNotes: "AI generated insights (raw text). Using algorithmic analysis for structured recommendations.",
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
