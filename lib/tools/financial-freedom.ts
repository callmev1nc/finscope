import type { ToolDefinition } from "./types";

export const financialFreedom: ToolDefinition = {
  slug: "financial-freedom",
  name: "Financial Freedom Timeline",
  description: "Calculate exactly when you'll achieve financial independence based on your current savings and spending.",
  icon: "CalendarCheck",
  category: "planning",
  isPremium: true,
  color: "amber",
  fields: [
    { key: "currentSavings", label: "Current Savings & Investments", type: "currency", required: true, defaultValue: 100000, group: "Your Finances", prefix: "$", min: 0 },
    { key: "monthlySavings", label: "Monthly Savings", type: "currency", required: true, defaultValue: 2000, group: "Your Finances", prefix: "$", min: 0 },
    { key: "annualExpenses", label: "Annual Living Expenses", type: "currency", required: true, defaultValue: 40000, group: "Your Finances", prefix: "$", min: 0 },
    { key: "expectedReturn", label: "Expected Annual Return (%)", type: "percentage", required: true, defaultValue: 7, group: "Assumptions", min: 1, max: 30, suffix: "%" },
    { key: "withdrawalRate", label: "Safe Withdrawal Rate (%)", type: "percentage", required: false, defaultValue: 4, group: "Assumptions", min: 2, max: 10, suffix: "%" },
    { key: "currentAge", label: "Your Current Age", type: "number", required: false, defaultValue: 30, group: "Personal", min: 18, max: 90 },
  ],
  calculate: (inputs) => {
    const savings = inputs.currentSavings as number;
    const monthly = inputs.monthlySavings as number;
    const expenses = inputs.annualExpenses as number;
    const returnRate = inputs.expectedReturn as number;
    const withdrawalRate = (inputs.withdrawalRate as number) || 4;
    const age = (inputs.currentAge as number) || 30;

    const fireNumber = expenses / (withdrawalRate / 100);
    const r = returnRate / 100 / 12;
    let runningSavings = savings;
    let years = 0;
    const maxYears = 80;
    const projection: { year: number; savings: number }[] = [];

    while (runningSavings < fireNumber && years < maxYears) {
      runningSavings = runningSavings * (1 + r) + monthly;
      years++;
      if (years % 5 === 0 || years === 1) {
        projection.push({ year: years, savings: Math.round(runningSavings) });
      }
    }
    if (runningSavings >= fireNumber && !projection.find((p) => p.year === years)) {
      projection.push({ year: years, savings: Math.round(runningSavings) });
    }

    const freedomAge = years < maxYears ? age + years : null;
    const progress = (savings / fireNumber) * 100;
    const totalContributed = savings + monthly * years * 12;
    const coastFire = (savings > 0) ? Math.log(fireNumber / savings) / Math.log(1 + returnRate / 100) : maxYears;

    const warnings: string[] = [];
    if (years >= maxYears) warnings.push("Financial freedom may not be achievable with current parameters within a lifetime.");
    if (withdrawalRate > 5) warnings.push("Withdrawal rate >5% is risky. The standard is 4% or lower.");
    if (savings <= 0) warnings.push("You need some savings to start. Begin with an emergency fund.");
    if (monthly * 12 > expenses) warnings.push("You save more than you spend annually — you're on a fast track to FIRE!");

    return {
      summary: years < maxYears
        ? `You'll reach financial freedom in ${years} years (age ${freedomAge}). You need $${Math.round(fireNumber).toLocaleString()} invested (${withdrawalRate}% SWR covers $${expenses.toLocaleString()}/yr).`
        : `Financial freedom may not be achievable with current numbers. Consider increasing savings or reducing expenses.`,
      metrics: [
        { label: "FIRE Number", value: `$${Math.round(fireNumber).toLocaleString()}`, isPositive: false },
        { label: "Current Savings", value: `$${savings.toLocaleString()}`, change: `${progress.toFixed(0)}% of goal`, isPositive: true },
        { label: "Time to Freedom", value: years < maxYears ? `${years} years` : "60+ years", isPositive: years < maxYears && years < 30 },
        { label: "Freedom Age", value: freedomAge ? `${freedomAge}` : "N/A", isPositive: freedomAge ? freedomAge < 60 : false },
      ],
      sections: [
        {
          title: "Wealth Projection vs FIRE Target",
          type: "chart",
          chartType: "bar",
          chartData: projection.map((p) => ({
            label: `Year ${p.year}`,
            value: p.savings,
            color: p.savings >= fireNumber ? "#10b981" : "#6366f1",
          })),
        },
        {
          title: "FIRE Calculation Summary",
          type: "table",
          headers: ["Metric", "Value"],
          rows: [
            ["Annual Expenses", `$${expenses.toLocaleString()}`],
            ["Safe Withdrawal Rate", `${withdrawalRate}%`],
            ["FIRE Number Needed", `$${Math.round(fireNumber).toLocaleString()}`],
            ["Current Savings", `$${savings.toLocaleString()}`],
            ["Monthly Contribution", `$${monthly.toLocaleString()}`],
            ["Expected Return", `${returnRate}%`],
            ["Years to Freedom", years < maxYears ? `${years}` : "60+"],
            ["Total Contributed", `$${Math.round(totalContributed).toLocaleString()}`],
            ["Investment Growth", `$${Math.round(runningSavings - totalContributed).toLocaleString()}`],
          ],
        },
      ],
      recommendations: [
        ...(years > 20 ? [{
          priority: "high" as const,
          title: "Increase Savings Rate",
          description: `${years} years is a long horizon. Try increasing savings by $${Math.round(monthly * 0.2).toLocaleString()}/mo to accelerate.`,
          impact: "Even 10% more savings = years less to freedom",
        }] : []),
        {
          priority: "medium" as const,
          title: "Optimize for Tax Efficiency",
          description: "Use tax-advantaged accounts (401k, IRA, HSA) and tax-loss harvesting to maximize growth.",
          impact: "Can add 1-2% to effective returns",
        },
        ...(withdrawalRate > 4 ? [{
          priority: "medium" as const,
          title: "Use a Conservative Withdrawal Rate",
          description: "Consider 3.5-4% SWR for a 30+ year retirement. Higher rates increase failure risk.",
          impact: `At 3.5% SWR: $${Math.round(expenses / 0.035).toLocaleString()} needed`,
        }] : []),
        {
          priority: "low" as const,
          title: "Explore Coast FIRE",
          description: coastFire < 40
            ? `With $${savings.toLocaleString()} invested, you could coast for ${Math.round(coastFire)} years without additional contributions.`
            : "Coast FIRE isn't viable yet — keep contributing.",
          impact: "Reduces the pressure to save aggressively",
        },
      ],
      warnings,
    };
  },
};
