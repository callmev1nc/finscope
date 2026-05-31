import type { ToolDefinition } from "./types";

export const paycheckInvesting: ToolDefinition = {
  slug: "paycheck-investing",
  name: "Paycheck-to-Investing System",
  description: "Turn a portion of every paycheck into a growing investment portfolio automatically.",
  icon: "Repeat",
  category: "investing",
  isPremium: false,
  color: "blue",
  fields: [
    { key: "paycheckAmount", label: "Per-Paycheck Amount (After Tax)", type: "currency", required: true, defaultValue: 2500, group: "Paycheck", prefix: "$", min: 0 },
    { key: "paychecksPerMonth", label: "Paychecks Per Month", type: "select", required: true, defaultValue: 2, group: "Paycheck", options: [{ label: "1 (Monthly)", value: "1" }, { label: "2 (Bi-weekly)", value: "2" }, { label: "4 (Weekly)", value: "4" }] },
    { key: "investPercentage", label: "% to Invest Per Paycheck", type: "percentage", required: true, defaultValue: 15, group: "Investment Plan", min: 0, max: 100, suffix: "%" },
    { key: "currentPortfolio", label: "Current Portfolio Value", type: "currency", required: true, defaultValue: 10000, group: "Investment Plan", prefix: "$", min: 0 },
    { key: "expectedReturn", label: "Expected Annual Return (%)", type: "percentage", required: true, defaultValue: 9, group: "Investment Plan", min: 1, max: 30, suffix: "%" },
    { key: "yearsPlan", label: "Years to Follow This Plan", type: "number", required: true, defaultValue: 10, group: "Goals", min: 1, max: 50 },
  ],
  calculate: (inputs) => {
    const paycheck = inputs.paycheckAmount as number;
    const paychecks = parseInt(inputs.paychecksPerMonth as string);
    const investPct = (inputs.investPercentage as number);
    const portfolio = inputs.currentPortfolio as number;
    const returnRate = inputs.expectedReturn as number;
    const years = inputs.yearsPlan as number;

    const perPaycheck = paycheck * (investPct / 100);
    const monthlyInvestment = perPaycheck * paychecks;
    const totalMonths = years * 12;
    const r = returnRate / 100 / 12;

    const futurePortfolio = portfolio * Math.pow(1 + r, totalMonths);
    const futureFromSIP = monthlyInvestment * ((Math.pow(1 + r, totalMonths) - 1) / r) * (1 + r);
    const totalFuture = futurePortfolio + futureFromSIP;
    const totalContributed = monthlyInvestment * totalMonths;

    const warnings: string[] = [];
    if (investPct < 5) warnings.push("Investing less than 5% may not outpace inflation.");
    if (perPaycheck > paycheck * 0.5) warnings.push("Investing over 50% per paycheck may be unsustainable.");
    if (years > 30) warnings.push("Very long horizon — review and adjust strategy periodically.");

    return {
      summary: `Invest $${perPaycheck.toLocaleString()} per paycheck (${investPct}%) → $${monthlyInvestment.toLocaleString()}/mo. In ${years} years: ~$${Math.round(totalFuture).toLocaleString()}.`,
      metrics: [
        { label: "Per Paycheck Invested", value: `$${perPaycheck.toLocaleString()}`, isPositive: true },
        { label: "Monthly Investment", value: `$${monthlyInvestment.toLocaleString()}`, isPositive: true },
        { label: "Total Contributed", value: `$${totalContributed.toLocaleString()}`, isPositive: true },
        { label: "Projected Value", value: `$${Math.round(totalFuture).toLocaleString()}`, change: `${years} years`, isPositive: true },
      ],
      sections: [
        {
          title: "Projected Growth",
          type: "chart",
          chartType: "bar",
          chartData: Array.from({ length: Math.min(years, 10) }, (_, i) => {
            const y = i + 1;
            const m = y * 12;
            const fv = portfolio * Math.pow(1 + r, m) + monthlyInvestment * ((Math.pow(1 + r, m) - 1) / r) * (1 + r);
            return { label: `Year ${y}`, value: Math.round(fv), color: "#6366f1" };
          }),
        },
        {
          title: "Investment Summary",
          type: "table",
          headers: ["Metric", "Value"],
          rows: [
            ["Per Paycheck Amount", `$${paycheck.toLocaleString()}`],
            ["Invested Per Paycheck", `$${perPaycheck.toLocaleString()}`],
            ["Monthly Total", `$${monthlyInvestment.toLocaleString()}`],
            ["Annual Investment", `$${(monthlyInvestment * 12).toLocaleString()}`],
            ["Total Invested (${years}y)", `$${totalContributed.toLocaleString()}`],
            ["Projected Value", `$${Math.round(totalFuture).toLocaleString()}`],
          ],
        },
      ],
      recommendations: [
        {
          priority: "high" as const,
          title: "Automate the Process",
          description: "Set up automatic transfers from your checking account on payday. What gets automated gets done.",
          impact: "Consistency is the #1 predictor of investing success",
        },
        ...(investPct < 15 ? [{
          priority: "medium" as const,
          title: "Increase to 15-20%",
          description: `At ${investPct}%, you're on track but could accelerate by increasing 1-2% per year.`,
          impact: `Each 1% = $${((paycheck * paychecks * 0.01) * 12 * years).toLocaleString()} more invested`,
        }] : []),
        {
          priority: "medium" as const,
          title: "Dollar-Cost Average Into Index Funds",
          description: "Invest the same amount consistently regardless of market conditions. Low-cost index funds are ideal.",
          impact: "Reduces timing risk and emotional investing",
        },
      ],
      warnings,
    };
  },
};
