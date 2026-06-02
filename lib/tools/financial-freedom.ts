import type { ToolDefinition } from "./types";

export const financialFreedom: ToolDefinition = {
  slug: "financial-freedom",
  name: "Financial Freedom Timeline",
  description: "Calculate exactly when you'll achieve financial independence based on your current savings and spending.",
  icon: "CalendarCheck",
  category: "planning",
  isPremium: false,
  color: "amber",
  fields: [
    { key: "currentSavings", label: "Current Savings & Investments", type: "currency", required: true, defaultValue: 100000, group: "Your Finances", prefix: "$", min: 0 },
    { key: "monthlySavings", label: "Monthly Savings", type: "currency", required: true, defaultValue: 2000, group: "Your Finances", prefix: "$", min: 0 },
    { key: "annualExpenses", label: "Annual Living Expenses", type: "currency", required: true, defaultValue: 40000, group: "Your Finances", prefix: "$", min: 0 },
    { key: "expectedReturn", label: "Expected Annual Return (%)", type: "percentage", required: true, defaultValue: 7, group: "Assumptions", min: 1, suffix: "%" },
    { key: "withdrawalRate", label: "Safe Withdrawal Rate (%)", type: "percentage", required: false, defaultValue: 4, group: "Assumptions", min: 2, suffix: "%" },
    { key: "currentAge", label: "Your Current Age", type: "number", required: false, defaultValue: 30, group: "Personal", min: 18 },
  ],
  calculate: (inputs) => {
    const savings = inputs.currentSavings as number;
    const monthly = inputs.monthlySavings as number;
    const expenses = inputs.annualExpenses as number;
    const returnRate = inputs.expectedReturn as number;
    const withdrawalRate = (inputs.withdrawalRate as number) || 4;
    const age = (inputs.currentAge as number) || 30;

    const fireNumber = expenses / (withdrawalRate / 100);
    const r = returnRate / 100 / 12; // monthly rate
    let runningSavings = savings;
    let years = 0;
    const maxYears = 80;
    const projection: { year: number; savings: number }[] = [];

    // Check if already at FIRE number
    const alreadyFIRE = savings >= fireNumber;

    if (alreadyFIRE) {
      // Already at FIRE number — still populate projection with some data
      projection.push({ year: 0, savings: Math.round(savings) });
      projection.push({ year: 5, savings: Math.round(savings * Math.pow(1 + returnRate / 100, 5)) });
      projection.push({ year: 10, savings: Math.round(savings * Math.pow(1 + returnRate / 100, 10)) });
    } else {
      while (runningSavings < fireNumber && years < maxYears) {
        // Fix: use proper annual compounding with monthly contributions
        // runningSavings compounds monthly for 12 months, plus 12 months of contributions
        runningSavings = runningSavings * Math.pow(1 + r, 12) + monthly * 12;
        years++;
        if (years % 5 === 0 || years === 1) {
          projection.push({ year: years, savings: Math.round(runningSavings) });
        }
      }
      if (runningSavings >= fireNumber && !projection.find((p) => p.year === years)) {
        projection.push({ year: years, savings: Math.round(runningSavings) });
      }
    }

    const freedomAge = alreadyFIRE ? age : (years < maxYears ? age + years : null);
    const progress = (savings / fireNumber) * 100;
    const totalContributed = savings + monthly * years * 12;

    // Fix coast FIRE formula: solve savings * (1 + returnRate/100)^years >= fireNumber for years
    // years = log(fireNumber / savings) / log(1 + returnRate/100)
    const coastFire = savings > 0
      ? Math.log(fireNumber / savings) / Math.log(1 + returnRate / 100)
      : maxYears;

    const warnings: string[] = [];
    if (!alreadyFIRE && years >= maxYears) warnings.push("Financial freedom may not be achievable with current parameters within a lifetime.");
    if (withdrawalRate > 5) warnings.push("Withdrawal rate >5% is risky. The standard is 4% or lower.");
    if (savings <= 0) warnings.push("You need some savings to start. Begin with an emergency fund.");
    if (alreadyFIRE) warnings.push("Congratulations! You've already reached your FIRE number!");
    if (monthly * 12 > expenses) warnings.push("You save more than you spend annually — you're on a fast track to FIRE!");

    return {
      summary: alreadyFIRE
        ? `You've already reached financial freedom! Your $${savings.toLocaleString()} covers $${expenses.toLocaleString()}/yr at ${withdrawalRate}% SWR (FIRE number: $${Math.round(fireNumber).toLocaleString()}).`
        : years < maxYears
          ? `You'll reach financial freedom in ${years} years (age ${freedomAge}). You need $${Math.round(fireNumber).toLocaleString()} invested (${withdrawalRate}% SWR covers $${expenses.toLocaleString()}/yr).`
          : `Financial freedom may not be achievable with current numbers. Consider increasing savings or reducing expenses.`,
      metrics: [
        { label: "FIRE Number", value: `$${Math.round(fireNumber).toLocaleString()}`, isPositive: false },
        { label: "Current Savings", value: `$${savings.toLocaleString()}`, change: `${progress.toFixed(0)}% of goal`, isPositive: true },
        { label: "Time to Freedom", value: alreadyFIRE ? "Already there!" : years < maxYears ? `${years} years` : "60+ years", isPositive: alreadyFIRE || (years < maxYears && years < 30) },
        { label: "Freedom Age", value: freedomAge ? `${freedomAge}` : alreadyFIRE ? `${age} (now)` : "N/A", isPositive: freedomAge ? freedomAge < 60 : alreadyFIRE },
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
            ["Years to Freedom", alreadyFIRE ? "Already reached!" : years < maxYears ? `${years}` : "60+"],
            ["Total Contributed", `$${Math.round(totalContributed).toLocaleString()}`],
            ["Investment Growth", `$${Math.round((alreadyFIRE ? savings : runningSavings) - totalContributed).toLocaleString()}`],
            ["Progress to FIRE", `${Math.min(progress, 100).toFixed(1)}%`],
          ],
        },
      ],
      recommendations: [
        ...(alreadyFIRE ? [{
          priority: "low" as const,
          title: "Maintain Your Strategy",
          description: `You've reached FIRE! Focus on preserving wealth through diversification and conservative withdrawal.`,
          impact: "Your savings can sustain $${expenses.toLocaleString()}/yr indefinitely",
        }] : []),
        ...(!alreadyFIRE && years > 20 ? [{
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
          description: coastFire < 40 && savings > 0
            ? `With $${savings.toLocaleString()} invested, you could coast for ${Math.round(coastFire)} years without additional contributions.`
            : "Coast FIRE isn't viable yet — keep contributing.",
          impact: "Reduces the pressure to save aggressively",
        },
      ],
      warnings,
    };
  },
};
