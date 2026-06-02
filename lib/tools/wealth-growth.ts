import type { ToolDefinition } from "./types";

export const wealthGrowth: ToolDefinition = {
  slug: "wealth-growth",
  name: "Wealth Growth Blueprint",
  description: "Project your wealth over time with systematic investing and compound growth.",
  icon: "TrendingUp",
  category: "investing",
  isPremium: false,
  color: "blue",
  fields: [
    { key: "currentAge", label: "Current Age", type: "number", required: true, defaultValue: 30, group: "Personal Info", min: 18 },
    { key: "retirementAge", label: "Target Retirement Age", type: "number", required: true, defaultValue: 60, group: "Personal Info", min: 18 },
    { key: "currentInvestments", label: "Current Investments", type: "currency", required: true, defaultValue: 50000, group: "Investments", prefix: "$", min: 0 },
    { key: "monthlyInvestment", label: "Monthly Investment", type: "currency", required: true, defaultValue: 1000, group: "Investments", prefix: "$", min: 0 },
    { key: "expectedReturn", label: "Expected Annual Return (%)", type: "percentage", required: true, defaultValue: 8, group: "Investments", min: 1, suffix: "%" },
    { key: "inflationRate", label: "Expected Inflation Rate (%)", type: "percentage", required: false, defaultValue: 3, group: "Investments", min: 0, suffix: "%" },
  ],
  calculate: (inputs) => {
    const age = inputs.currentAge as number;
    const retire = inputs.retirementAge as number;
    const current = inputs.currentInvestments as number;
    const monthly = inputs.monthlyInvestment as number;
    const annualReturn = inputs.expectedReturn as number;
    const inflation = (inputs.inflationRate as number) || 3;

    const years = retire - age;

    // Fix: division by zero when years <= 0 (retirement age <= current age)
    const warnings: string[] = [];
    if (years <= 0) {
      warnings.push("Retirement age must be greater than current age. Please adjust your inputs.");
      return {
        summary: "Unable to project wealth growth: retirement age must be after current age.",
        metrics: [
          { label: "Current Age", value: `${age}`, isPositive: true },
          { label: "Retirement Age", value: `${retire}`, isPositive: false },
          { label: "Error", value: "Invalid inputs", isPositive: false },
        ],
        sections: [],
        recommendations: [
          {
            priority: "high" as const,
            title: "Adjust Retirement Age",
            description: "Set a retirement age greater than your current age to generate a projection.",
            impact: "Required for any meaningful planning",
          },
        ],
        warnings,
      };
    }

    const months = years * 12;
    const r = annualReturn / 100 / 12;

    const futureFromLump = current * Math.pow(1 + r, months);
    const futureFromSIP = monthly * ((Math.pow(1 + r, months) - 1) / r) * (1 + r);
    const totalFuture = futureFromLump + futureFromSIP;
    const inflationFactor = Math.pow(1 + inflation / 100, years);
    const futureValueReal = totalFuture / inflationFactor;
    const totalContributed = current + monthly * months;
    const investmentGain = totalFuture - totalContributed;

    // Fix: extract r variable instead of repeating annualReturn / 100 / 12
    const milestones = [5, 10, 15, 20, 25, 30].filter((y) => y <= years);
    const milestoneData = milestones.map((y) => {
      const m = y * 12;
      const fv = current * Math.pow(1 + r, m) + monthly * ((Math.pow(1 + r, m) - 1) / r) * (1 + r);
      const contributed = current + monthly * m;
      return { year: y, value: Math.round(fv), contributed: Math.round(contributed), gain: Math.round(fv - contributed) };
    });

    if (years < 5) warnings.push("Short investment horizon — consider less volatile assets.");
    if (annualReturn > 15) warnings.push("Expected return >15% is very optimistic. Use 6-10% for conservative planning.");
    if (monthly < 100) warnings.push("Monthly investment is low. Try to increase gradually.");
    if (inflation > annualReturn) warnings.push("Inflation exceeds expected return — your purchasing power will decrease.");

    const realReturn = ((1 + annualReturn / 100) / (1 + inflation / 100) - 1) * 100;
    const annualSIP = monthly * 12;

    return {
      summary: `By age ${retire}, your investments could grow to $${Math.round(totalFuture).toLocaleString()} ($${Math.round(futureValueReal).toLocaleString()} in today's dollars).`,
      metrics: [
        { label: "Total Invested", value: `$${totalContributed.toLocaleString()}`, isPositive: true },
        { label: "Projected Value (Nominal)", value: `$${Math.round(totalFuture).toLocaleString()}`, change: `${years}y horizon`, isPositive: true },
        { label: "Projected Value (Real)", value: `$${Math.round(futureValueReal).toLocaleString()}`, change: "Adjusted for inflation", isPositive: true },
        { label: "Investment Gain", value: `$${Math.round(investmentGain).toLocaleString()}`, isPositive: true },
      ],
      sections: [
        {
          title: "Wealth Growth Projection (Nominal)",
          type: "chart",
          chartType: "bar",
          chartData: milestoneData.map((m) => ({
            label: `${m.year}y`,
            value: m.value,
            color: "#6366f1",
          })),
        },
        {
          title: "Milestone Projections",
          type: "table",
          headers: ["Year", "Age", "Projected Value", "Total Invested", "Growth", "% Growth"],
          rows: milestoneData.map((m) => [
            m.year,
            age + m.year,
            `$${m.value.toLocaleString()}`,
            `$${m.contributed.toLocaleString()}`,
            `$${m.gain.toLocaleString()}`,
            m.contributed > 0 ? `${((m.gain / m.contributed) * 100).toFixed(0)}%` : "0%",
          ]),
        },
        {
          title: "Growth Breakdown",
          type: "table",
          headers: ["Component", "Value"],
          rows: [
            ["Initial Lump Sum Grows To", `$${Math.round(futureFromLump).toLocaleString()}`],
            ["SIP Contributions Grow To", `$${Math.round(futureFromSIP).toLocaleString()}`],
            ["Total Nominal Value", `$${Math.round(totalFuture).toLocaleString()}`],
            ["Inflation Adjustment Factor", `${inflationFactor.toFixed(2)}x over ${years} years`],
            ["Real (Inflation-Adjusted) Value", `$${Math.round(futureValueReal).toLocaleString()}`],
            ["Real Annual Return", `${realReturn.toFixed(1)}%`],
            ["Annual Investment Amount", `$${annualSIP.toLocaleString()}`],
          ],
        },
      ],
      recommendations: [
        {
          priority: "high" as const,
          title: "Increase SIP by 10% Every Year",
          description: "Increase your monthly investment by 10% annually to accelerate wealth growth significantly.",
          impact: "Could add 30-50% more at retirement",
        },
        {
          priority: "medium" as const,
          title: "Diversify Your Portfolio",
          description: "Spread investments across equities, bonds, real estate, and international markets for risk management.",
          impact: "Reduces volatility while maintaining returns",
        },
        ...(years > 10 ? [{
          priority: "medium" as const,
          title: "Consider Tax-Advantaged Accounts",
          description: "Max out 401(k), IRA, or equivalent retirement accounts before taxable investments.",
          impact: "Saves 15-30% in taxes on investment gains",
        }] : []),
        {
          priority: "low" as const,
          title: "Rebalance Annually",
          description: "Review your asset allocation once a year and rebalance to maintain your target risk profile.",
          impact: "Locks in gains and manages risk",
        },
      ],
      warnings,
    };
  },
};
