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
    { key: "savingsGrowthRate", label: "Annual Savings Growth Rate (%)", type: "percentage", required: false, defaultValue: 5, group: "Growth Plan", min: 0, suffix: "%" },
    { key: "investmentReturn", label: "Expected Investment Return (%)", type: "percentage", required: true, defaultValue: 8, group: "Growth Plan", min: 1, suffix: "%" },
  ],
  calculate: (inputs) => {
    const netWorth = inputs.currentNetWorth as number;
    const income = inputs.annualIncome as number;
    const monthly = inputs.monthlySavings as number;
    const savingsGrowth = (inputs.savingsGrowthRate as number) || 5;
    const returnRate = inputs.investmentReturn as number;

    // Fix: when netWorth is 0, target is 0 — use income * 10 as minimum target
    const target = netWorth > 0 ? netWorth * 10 : income * 10;

    const r = returnRate / 100 / 12;
    const maxYears = 60;

    // --- Multi-scenario projections ---
    const scenarios = [
      { name: "Conservative", rate: returnRate - 3 },
      { name: "Moderate", rate: returnRate },
      { name: "Aggressive", rate: returnRate + 3 },
    ];

    const scenarioResults = scenarios.map((scenario) => {
      const sr = scenario.rate / 100 / 12;
      let nw = netWorth;
      let year = 0;
      let currentMonthly = monthly;
      const yearlyData: { year: number; netWorth: number; income: number }[] = [];

      while (nw < target && year < maxYears) {
        nw = nw * (1 + sr) + currentMonthly * 12;
        year++;
        currentMonthly = currentMonthly * (1 + savingsGrowth / 100);
        // Fix: push data every year for smoother chart
        yearlyData.push({ year, netWorth: Math.round(nw), income: Math.round(income * Math.pow(1 + savingsGrowth / 100, year)) });
      }

      // Fix: avgGrowth division by zero when year = 0
      const avgGrowth = year > 0 ? (Math.pow(nw / (netWorth > 0 ? netWorth : 1), 1 / year) - 1) * 100 : 0;

      return { ...scenario, years: year, finalNW: Math.round(nw), avgGrowth, yearlyData };
    });

    // Use the moderate scenario for the main display
    const moderate = scenarioResults[1];
    const year = moderate.years;
    const avgGrowth = moderate.avgGrowth;
    const yearlyData = moderate.yearlyData;

    const warnings: string[] = [];
    if (year >= maxYears) warnings.push("10x may not be achievable in a lifetime with current parameters.");
    if (target > income * 20) warnings.push("Target is very ambitious relative to income. Consider a longer timeline.");
    if (monthly * 12 > income * 0.5) warnings.push("Saving >50% of income is aggressive but powerful.");
    if (returnRate > 12) warnings.push("Return >12% is optimistic. Use 6-10% for realistic projections.");
    if (netWorth <= 0) warnings.push("Starting with zero net worth. Target is set to 10x your annual income instead.");

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
          chartData: yearlyData.slice(0, 20).map((d) => ({
            label: `Year ${d.year}`,
            value: d.netWorth,
            color: d.netWorth >= target ? "#10b981" : "#6366f1",
          })),
        },
        {
          title: "Growth Milestones",
          type: "table",
          headers: ["Year", "Projected Net Worth", "Est. Income", "Growth Factor"],
          rows: yearlyData.filter((_, i) => i % 2 === 0 || yearlyData[i].netWorth >= target).slice(0, 15).map((d) => [
            d.year,
            `$${d.netWorth.toLocaleString()}`,
            `$${d.income.toLocaleString()}`,
            `${(d.netWorth / (netWorth > 0 ? netWorth : 1)).toFixed(1)}x`,
          ]),
        },
        {
          title: "Scenario Comparison",
          type: "table",
          headers: ["Scenario", "Return Rate", "Years to 10x", "Final Net Worth", "Avg Growth"],
          rows: scenarioResults.map((s) => [
            s.name,
            `${s.rate > 0 ? '+' : ''}${s.rate}%`,
            s.years < maxYears ? `${s.years} years` : "60+",
            `$${s.finalNW.toLocaleString()}`,
            `${s.avgGrowth.toFixed(1)}%`,
          ]),
        },
      ],
      recommendations: [
        ...(year > 20 ? [{
          priority: "high" as const,
          title: "Accelerate with Income Growth",
          description: `${year} years is long. Focus on increasing income, not just savings rate. Consider side income, promotions, or career pivots.`,
          impact: `Each $${Math.round(income * 0.1).toLocaleString()} more income = ~$${Math.round(income * 0.1 * 0.5 * year).toLocaleString()} more invested over ${year} years`,
        }] : []),
        {
          priority: "high" as const,
          title: "Invest Early and Consistently",
          description: "Time in the market beats timing the market. Automate monthly investments into low-cost index funds (e.g., VTI, VOO, or target-date funds).",
          impact: `Compounding at ${returnRate}% turns $${monthly.toLocaleString()}/mo into $${Math.round(yearlyData.length > 0 ? yearlyData[yearlyData.length - 1].netWorth : 0).toLocaleString()} in ${year} years`,
        },
        {
          priority: "medium" as const,
          title: "Maximize Tax-Advantaged Accounts",
          description: "Use 401(k), IRA, HSA to their limits before taxable accounts for maximum compound growth. Employer 401(k) match is free money.",
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
          description: "Monitoring progress creates accountability and motivation. Use a spreadsheet or app to review monthly.",
          impact: "People who track save 2x more",
        },
        {
          priority: "low" as const,
          title: "Review and Rebalance Annually",
          description: "Check your asset allocation yearly. Rebalance to maintain your target mix of stocks, bonds, and alternatives.",
          impact: "Keeps risk in check while maximizing returns",
        },
      ],
      warnings,
    };
  },
};
