/**
 * AI Service for FinScope
 *
 * Uses Google Gemini API (free tier) for enhanced financial recommendations.
 * Falls back to smart algorithmic analysis when no API key is configured.
 *
 * Free tier: 15 RPM, 1M TPM, 1500 RPD — more than enough for this app.
 * Get your key at: https://aistudio.google.com/apikey
 */

export interface AIRecommendationRequest {
  toolSlug: string;
  toolName: string;
  inputs: Record<string, number | string | undefined>;
  calculationResult: {
    summary: string;
    metrics: { label: string; value: string; change?: string }[];
    warnings: string[];
  };
  userContext?: string;
}

export interface AIRecommendation {
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  reasoning: string;
}

export interface AIResponse {
  recommendations: AIRecommendation[];
  enhancedSummary?: string;
  analysisNotes?: string;
}

/**
 * Generate AI-enhanced recommendations via server-side API route.
 * Falls back to smart algorithmic analysis if AI is unavailable.
 */
export async function getAIRecommendations(request: AIRecommendationRequest): Promise<AIResponse> {
  try {
    const response = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      return getAlgorithmicRecommendations(request);
    }

    const data = await response.json();
    return data as AIResponse;
  } catch {
    return getAlgorithmicRecommendations(request);
  }
}

/**
 * Smart algorithmic fallback — generates detailed, personalized recommendations
 * without requiring any AI API. Uses financial heuristics and the user's actual inputs.
 */
function getAlgorithmicRecommendations(request: AIRecommendationRequest): AIResponse {
  const { toolSlug, inputs, calculationResult } = request;
  const recommendations: AIRecommendation[] = [];

  switch (toolSlug) {
    case "net-worth-simulator": {
      const nw = (inputs.currentNetWorth as number) || 0;
      const income = (inputs.annualIncome as number) || 0;
      const savings = (inputs.monthlySavings as number) || 0;
      const returnRate = (inputs.investmentReturn as number) || 8;

      if (savings > 0 && income > 0) {
        const savingsRate = (savings * 12) / income;
        recommendations.push({
          title: "Optimize Your Savings Rate",
          description: `You're saving ${Math.round(savingsRate * 100)}% of income. The 50/30/20 rule suggests 20% minimum. ${savingsRate >= 0.2 ? "You're exceeding this — great discipline!" : "Try to reach 20% for faster growth."}`,
          priority: savingsRate < 0.15 ? "high" : "medium",
          reasoning: `Based on your $${income.toLocaleString()} income and $${savings.toLocaleString()}/mo savings, your savings rate directly impacts how fast you reach 10x.`,
        });
      }

      if (returnRate > 10) {
        recommendations.push({
          title: "Diversify for Sustainable Returns",
          description: `Your ${returnRate}% expected return is above historical market average (7-10%). Consider a diversified portfolio to manage risk while targeting growth.`,
          priority: "medium",
          reasoning: "Higher expected returns come with higher volatility. A diversified portfolio can help achieve consistent growth closer to your projections.",
        });
      }

      if (nw > 0 && income > 0) {
        const ratio = nw / income;
        recommendations.push({
          title: ratio < 2 ? "Focus on Income Growth" : "Shift to Investment Optimization",
          description: ratio < 2
            ? `Your net worth is ${ratio.toFixed(1)}x income. At this stage, increasing income has the biggest impact on 10x growth.`
            : `Your net worth is ${ratio.toFixed(1)}x income. Investment returns now matter more than savings — optimize your portfolio allocation.`,
          priority: ratio < 2 ? "high" : "medium",
          reasoning: `At ${ratio.toFixed(1)}x ratio, ${ratio < 2 ? "income growth compounds faster" : "compound interest becomes the dominant growth driver"}.`,
        });
      }
      break;
    }

    case "wealth-growth": {
      const monthly = (inputs.monthlyInvestment as number) || 0;
      const current = (inputs.currentInvestments as number) || 0;
      const returnRate = (inputs.expectedReturn as number) || 8;

      recommendations.push({
        title: "Implement Step-Up SIP",
        description: `Increase your monthly $${monthly.toLocaleString()} investment by 10-15% each year. This small annual increase can add 40-60% more to your final wealth.`,
        priority: "high",
        reasoning: `Based on your current SIP of $${monthly.toLocaleString()}, a 10% annual step-up leverages expected income growth for exponential compounding.`,
      });

      if (current > 0 && returnRate > 0) {
        recommendations.push({
          title: "Monitor Asset Allocation Quarterly",
          description: `With $${current.toLocaleString()} invested at ${returnRate}% expected return, rebalancing quarterly prevents drift and maintains your risk profile.`,
          priority: "medium",
          reasoning: "As markets move, your allocation drifts from targets. Quarterly rebalancing sells high-performing assets and buys undervalued ones — automatic buy low, sell high.",
        });
      }
      break;
    }

    case "expense-optimization": {
      const income = (inputs.monthlyIncome as number) || 0;
      const housing = (inputs.housing as number) || 0;
      const dining = (inputs.diningOut as number) || 0;
      const groceries = (inputs.groceries as number) || 0;

      if (income > 0 && housing > income * 0.3) {
        recommendations.push({
          title: "Address Housing Cost Burden",
          description: `Housing is ${Math.round((housing / income) * 100)}% of income — above the recommended 30%. Consider house hacking, roommates, or downsizing.`,
          priority: "high",
          reasoning: `At $${housing.toLocaleString()}/mo on $${income.toLocaleString()} income, housing consumes resources that could go toward wealth building.`,
        });
      }

      if (dining > groceries && groceries > 0) {
        recommendations.push({
          title: "Rebalance Food Spending",
          description: `You spend $${dining.toLocaleString()} dining out vs $${groceries.toLocaleString()} on groceries. Meal prepping 3x/week could save $${Math.round((dining - groceries) * 0.5)}/mo.`,
          priority: "medium",
          reasoning: "Dining out typically costs 3-5x more per meal than cooking. Even partial rebalancing creates significant monthly savings.",
        });
      }
      break;
    }

    default: {
      if (calculationResult.warnings.length > 0) {
        recommendations.push({
          title: "Review the Warnings Above",
          description: calculationResult.warnings.join(" "),
          priority: "high",
          reasoning: "These warnings indicate areas where your financial plan may need adjustment based on common financial best practices.",
        });
      }
    }
  }

  return {
    recommendations,
    analysisNotes: recommendations.length > 0
      ? "Analysis based on your inputs and financial best practices."
      : undefined,
  };
}
