import type { ToolDefinition } from "./types";

export const netWorthSimulator: ToolDefinition = {
  slug: "net-worth-simulator",
  name: "10x Net Worth Simulator",
  description: "Simulate a 10x net worth growth plan with actionable steps and realistic timelines.",
  icon: "Rocket",
  category: "planning",
  isPremium: false,
  color: "amber",
  fields: [
    { key: "currentNetWorth", label: "Current Net Worth", type: "currency", required: true, defaultValue: 50000, group: "Current Status", prefix: "$", min: 0 },
    { key: "annualIncome", label: "Annual Income", type: "currency", required: true, defaultValue: 80000, group: "Current Status", prefix: "$", min: 0 },
    { key: "monthlySavings", label: "Monthly Savings (to invest)", type: "currency", required: true, defaultValue: 1500, group: "Growth Plan", prefix: "$", min: 0 },
    { key: "savingsGrowthRate", label: "Annual Savings Growth Rate (%)", type: "percentage", required: false, defaultValue: 5, group: "Growth Plan", min: 0, max: 50, suffix: "%" },
    { key: "investmentReturn", label: "Expected Investment Return (%)", type: "percentage", required: true, defaultValue: 8, group: "Growth Plan", min: 1, max: 30, suffix: "%" },
  ],
  calculate: (inputs) => {
    const netWorth = inputs.currentNetWorth as number;
    const income = inputs.annualIncome as number;
    const monthly = inputs.monthlySavings as number;
    const savingsGrowth = (inputs.savingsGrowthRate as number) || 5;
    const returnRate = inputs.investmentReturn as number;

    const target = netWorth * 10;
    const r = returnRate / 100 / 12;
    let nw = netWorth;
    let year = 0;
    let currentMonthly = monthly;
    const maxYears = 60;
    const yearlyData: { year: number; netWorth: number; income: number }[] = [];

    while (nw < target && year < maxYears) {
      nw = nw * (1 + r) + currentMonthly * 12;
      year++;
      currentMonthly = currentMonthly * (1 + savingsGrowth / 100);
      if (year % 2 === 0 || nw >= target) {
        yearlyData.push({ year, netWorth: Math.round(nw), income: Math.round(income * Math.pow(1 + savingsGrowth / 100, year)) });
      }
    }

    const avgGrowth = year > 0 ? (Math.pow(nw / netWorth, 1 / year) - 1) * 100 : 0;

    const warnings: string[] = [];
    if (year >= maxYears) warnings.push("10x may not be achievable in a lifetime with current parameters.");
    if (target > income * 20) warnings.push("Target is very ambitious relative to income. Consider a longer timeline.");
    if (monthly * 12 > income * 0.5) warnings.push("Saving >50% of income is aggressive but powerful.");
    if (returnRate > 12) warnings.push("Return >12% is optimistic. Use 6-10% for realistic projections.");

    return {
      summary: year < maxYears
        ? `10x your net worth in ~${year} years! Go from $${netWorth.toLocaleString()} to $${Math.round(target).toLocaleString()} with avg ${avgGrowth.toFixed(0)}% annual growth.`
        : `May not be achievable within a reasonable timeframe. Try increasing savings or returns.`,
      metrics: [
        { label: "Current Net Worth", value: `$${netWorth.toLocaleString()}`, isPositive: true },
        { label: "10x Target", value: `$${Math.round(target).toLocaleString()}`, isPositive: false },
        { label: "Time to 10x", value: year < maxYears ? `${year} years` : "60+", isPositive: year < maxYears && year <= 30 },
        { label: "Avg Annual Growth", value: `${avgGrowth.toFixed(1)}%`, isPositive: avgGrowth >= 10 },
      ],
      sections: [
        {
          title: "Net Worth Growth Path",
          type: "chart",
          chartType: "bar",
          chartData: yearlyData.slice(0, 15).map((d) => ({
            label: `Year ${d.year}`,
            value: d.netWorth,
            color: d.netWorth >= target ? "#10b981" : "#6366f1",
          })),
        },
        {
          title: "Growth Milestones",
          type: "table",
          headers: ["Year", "Projected Net Worth", "Est. Income", "Growth Factor"],
          rows: yearlyData.slice(0, 10).map((d) => [
            d.year,
            `$${d.netWorth.toLocaleString()}`,
            `$${d.income.toLocaleString()}`,
            `${(d.netWorth / netWorth).toFixed(1)}x`,
          ]),
        },
      ],
      recommendations: [
        ...(year > 20 ? [{
          priority: "high" as const,
          title: "Accelerate with Income Growth",
          description: `${year} years is long. Focus on increasing income, not just savings rate.`,
          impact: `Each $${Math.round(income * 0.1).toLocaleString()} more income = ~$${Math.round(income * 0.1 * 0.5 * year).toLocaleString()} more invested`,
        }] : []),
        {
          priority: "medium" as const,
          title: "Maximize Tax-Advantaged Accounts",
          description: "Use 401(k), IRA, HSA to their limits before taxable accounts for maximum compound growth.",
          impact: "Saves 15-30% in taxes annually",
        },
        ...(year <= 15 ? [{
          priority: "medium" as const,
          title: "Consider Leveraged Growth",
          description: "Real estate or business investments can accelerate growth beyond market returns.",
          impact: "Potential 12-20% returns with leverage",
        }] : []),
        {
          priority: "low" as const,
          title: "Track Net Worth Monthly",
          description: "Monitoring progress creates accountability and motivation. Use a spreadsheet or app.",
          impact: "People who track save 2x more",
        },
      ],
      warnings,
    };
  },
};
