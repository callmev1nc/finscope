import type { ToolDefinition } from "./types";

export const sideHustle: ToolDefinition = {
  slug: "side-hustle",
  name: "Side Hustle Validator",
  description: "Evaluate whether a side hustle idea is worth your time, effort, and investment.",
  icon: "Briefcase",
  category: "income",
  isPremium: false,
  color: "purple",
  fields: [
    { key: "hustleName", label: "Side Hustle Name", type: "text", required: true, defaultValue: "Freelance Writing", group: "Hustle Details", placeholder: "e.g. Uber, Etsy, Freelancing" },
    { key: "setupCost", label: "Setup Cost", type: "currency", required: false, defaultValue: 500, group: "Hustle Details", prefix: "$", min: 0 },
    { key: "monthlyRevenue", label: "Expected Monthly Revenue", type: "currency", required: true, defaultValue: 1500, group: "Hustle Details", prefix: "$", min: 0 },
    { key: "monthlyCosts", label: "Monthly Operating Costs", type: "currency", required: false, defaultValue: 200, group: "Hustle Details", prefix: "$", min: 0 },
    { key: "hoursPerWeek", label: "Hours Per Week", type: "number", required: true, defaultValue: 10, group: "Time & Effort", min: 1 },
    { key: "learningMonths", label: "Months to Learn & Ramp Up", type: "number", required: false, defaultValue: 2, group: "Time & Effort", min: 0 },
    { key: "riskLevel", label: "Risk Level", type: "select", required: true, defaultValue: "medium", group: "Assessment", options: [{ label: "Low", value: "low" }, { label: "Medium", value: "medium" }, { label: "High", value: "high" }] },
    { key: "satisfactionScore", label: "Enjoyment (1-10)", type: "number", required: false, defaultValue: 7, group: "Assessment", min: 0 },
  ],
  calculate: (inputs) => {
    const name = inputs.hustleName as string;
    const setup = (inputs.setupCost as number) || 0;
    const revenue = inputs.monthlyRevenue as number;
    const costs = (inputs.monthlyCosts as number) || 0;
    const hours = inputs.hoursPerWeek as number;
    const risk = inputs.riskLevel as string;
    const satisfaction = (inputs.satisfactionScore as number) || 5;
    const learningMonths = (inputs.learningMonths as number) || 0;

    const monthlyProfit = revenue - costs;
    const monthlyHours = hours * 4.33;
    const hourlyRate = monthlyHours > 0 ? monthlyProfit / monthlyHours : 0;

    // Fix breakEvenMonths: handle 0 or negative profit properly
    let breakEvenMonths: number | string;
    if (setup <= 0) {
      breakEvenMonths = "N/A (no setup cost)";
    } else if (monthlyProfit <= 0) {
      breakEvenMonths = "Never (not profitable)";
    } else {
      breakEvenMonths = `${Math.ceil(setup / monthlyProfit)} months`;
    }

    const breakEvenNum = setup > 0 && monthlyProfit > 0 ? Math.ceil(setup / monthlyProfit) : Infinity;
    const roi = setup > 0 && monthlyProfit > 0 ? ((monthlyProfit * 12 - setup) / setup) * 100 : (monthlyProfit <= 0 ? -100 : 0);
    const yearlyProfit = monthlyProfit * 12 - setup;

    // Viability score with balanced factors
    const profitabilityScore = Math.min(25, Math.max(0, (hourlyRate / 50) * 25));
    const scaleScore = Math.min(25, Math.max(0, (monthlyProfit / 2000) * 25));
    const enjoymentScore = Math.min(25, (satisfaction / 10) * 25);
    const riskScore = risk === "low" ? 25 : risk === "medium" ? 15 : 5;
    const viabilityScore = Math.min(100, Math.max(0, Math.round(
      profitabilityScore + scaleScore + enjoymentScore + riskScore
    )));

    const viabilityLabel = viabilityScore >= 70 ? "Promising" : viabilityScore >= 40 ? "Moderate" : "Challenging";

    // Time investment analysis
    const weeklyTimeCommitment = hours > 20 ? "Heavy" : hours > 10 ? "Moderate" : "Light";
    const rampUpPeriod = learningMonths > 0 ? `${learningMonths} months` : "Minimal";

    const warnings: string[] = [];
    if (monthlyProfit <= 0) warnings.push("This hustle isn't profitable at current revenue/costs. Increase revenue or reduce costs before investing more time.");
    if (hourlyRate < 15 && monthlyProfit > 0) warnings.push(`Your effective hourly rate is $${hourlyRate.toFixed(2)} — below $15/hr target.`);
    if (setup > 0 && monthlyProfit > 0 && breakEvenNum > 6) warnings.push("Setup cost is high relative to monthly profit. Long break-even period.");
    if (hours > 20) warnings.push("20+ hrs/week on a side hustle may lead to burnout alongside a full-time job.");
    if (satisfaction < 4) warnings.push("Low enjoyment score. You're unlikely to sustain something you dislike.");

    return {
      summary: `"${name}" — estimated $${monthlyProfit.toLocaleString()}/mo profit at $${hourlyRate.toFixed(2)}/hr. Viability score: ${viabilityScore}/100 (${viabilityLabel}).`,
      metrics: [
        { label: "Monthly Profit", value: `$${monthlyProfit.toLocaleString()}`, isPositive: monthlyProfit > 0 },
        { label: "Hourly Rate", value: `$${hourlyRate.toFixed(2)}`, change: hourlyRate >= 15 ? "Good" : "Below target", isPositive: hourlyRate >= 15 },
        { label: "Yearly Profit", value: `$${Math.round(yearlyProfit).toLocaleString()}`, isPositive: yearlyProfit > 0 },
        { label: "Viability Score", value: `${viabilityScore}/100`, change: viabilityLabel, isPositive: viabilityScore >= 40 },
        { label: "Break-Even", value: typeof breakEvenMonths === "string" ? breakEvenMonths : `${breakEvenMonths}`, isPositive: breakEvenNum <= 6 },
        { label: "Time Commitment", value: `${hours} hrs/wk (${weeklyTimeCommitment})`, isPositive: hours <= 20 },
      ],
      sections: [
        {
          title: "Financial Breakdown",
          type: "table",
          headers: ["Metric", "Value"],
          rows: [
            ["Monthly Revenue", `$${revenue.toLocaleString()}`],
            ["Monthly Costs", `$${costs.toLocaleString()}`],
            ["Monthly Profit", `$${monthlyProfit.toLocaleString()}`],
            ["Hours per Week", `${hours}`],
            ["Effective Hourly Rate", `$${hourlyRate.toFixed(2)}`],
            ["Setup Cost", `$${setup.toLocaleString()}`],
            ["Ramp-Up Period", rampUpPeriod],
            ["ROI (First Year)", `${roi.toFixed(0)}%`],
            ["Break-Even", typeof breakEvenMonths === "string" ? breakEvenMonths : `${breakEvenMonths}`],
          ],
        },
        {
          title: "Viability Analysis",
          type: "table",
          headers: ["Factor", "Score", "Weight"],
          rows: [
            ["Profitability (hourly rate)", `${Math.round(profitabilityScore)}/25`, "25%"],
            ["Scale (monthly profit)", `${Math.round(scaleScore)}/25`, "25%"],
            ["Enjoyment", `${Math.round(enjoymentScore)}/25`, "25%"],
            ["Risk Level", `${riskScore}/25`, "25%"],
            ["Total", `${viabilityScore}/100`, viabilityLabel],
          ],
        },
      ],
      recommendations: [
        ...(monthlyProfit <= 0 ? [{
          priority: "high" as const,
          title: "Fix Profitability First",
          description: `Revenue ($${revenue.toLocaleString()}/mo) doesn't cover costs ($${costs.toLocaleString()}/mo). Raise prices, cut costs, or pivot your approach.`,
          impact: `Need $${(costs - revenue + 1).toLocaleString()} more revenue/mo to break even`,
        }] : []),
        ...(hourlyRate < 15 && monthlyProfit > 0 ? [{
          priority: "high" as const,
          title: "Increase Your Rate",
          description: `At $${hourlyRate.toFixed(2)}/hr, consider raising prices or finding higher-value work within the same niche.`,
          impact: `Target: $20/hr = $${Math.round(20 * monthlyHours).toLocaleString()}/mo`,
        }] : []),
        ...(monthlyProfit > 0 && monthlyProfit < 500 ? [{
          priority: "medium" as const,
          title: "Scale Your Efforts",
          description: "Look for ways to scale — automate, outsource, or increase capacity to grow beyond $500/mo profit.",
          impact: "Doubling hours could double income",
        }] : []),
        ...(monthlyProfit >= 500 && monthlyProfit < 2000 ? [{
          priority: "medium" as const,
          title: "Optimize for Growth",
          description: "You have a solid base. Focus on systems and processes to scale without proportionally increasing hours.",
          impact: `Target: $2,000+/mo at current ${hours} hrs/wk`,
        }] : []),
        ...(satisfaction < 5 ? [{
          priority: "medium" as const,
          title: "Consider Alternatives",
          description: "Your enjoyment score is low. A side hustle you dislike is hard to sustain. Try a different idea.",
          impact: "Long-term sustainability is key",
        }] : []),
        ...(risk === "high" ? [{
          priority: "low" as const,
          title: "Mitigate Risk First",
          description: "Test on a small scale before investing significant time/money. Validate demand with a minimal viable product.",
          impact: "Reduces financial downside",
        }] : []),
        {
          priority: "low" as const,
          title: "Track Everything",
          description: "Use a simple spreadsheet to track hours, revenue, and expenses monthly. Data beats guessing.",
          impact: "Identifies trends and optimization opportunities",
        },
      ],
      warnings,
    };
  },
};
