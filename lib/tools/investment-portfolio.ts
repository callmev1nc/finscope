import type { ToolDefinition } from "./types";

export const investmentPortfolio: ToolDefinition = {
  slug: "investment-portfolio",
  name: "Investment Portfolio Builder",
  description: "Design a diversified investment portfolio tailored to your risk tolerance and goals.",
  icon: "PieChart",
  category: "investing",
  isPremium: true,
  color: "blue",
  fields: [
    { key: "investmentAmount", label: "Total Amount to Invest", type: "currency", required: true, defaultValue: 50000, group: "Portfolio", prefix: "$", min: 0 },
    { key: "riskTolerance", label: "Risk Tolerance", type: "select", required: true, defaultValue: "moderate", group: "Profile", options: [{ label: "Conservative", value: "conservative" }, { label: "Moderate", value: "moderate" }, { label: "Aggressive", value: "aggressive" }, { label: "Very Aggressive", value: "very_aggressive" }] },
    { key: "investmentHorizon", label: "Investment Horizon (Years)", type: "number", required: true, defaultValue: 15, group: "Profile", min: 1, max: 50 },
    { key: "monthlyAddition", label: "Monthly Additional Investment", type: "currency", required: false, defaultValue: 500, group: "Profile", prefix: "$", min: 0 },
    { key: "includeBonds", label: "Include Bonds?", type: "select", required: false, defaultValue: "yes", group: "Preferences", options: [{ label: "Yes", value: "yes" }, { label: "No", value: "no" }] },
    { key: "includeInternational", label: "Include International?", type: "select", required: false, defaultValue: "yes", group: "Preferences", options: [{ label: "Yes", value: "yes" }, { label: "No", value: "no" }] },
  ],
  calculate: (inputs) => {
    const amount = inputs.investmentAmount as number;
    const risk = inputs.riskTolerance as string;
    const horizon = inputs.investmentHorizon as number;
    const monthly = (inputs.monthlyAddition as number) || 0;
    const inclBonds = (inputs.includeBonds as string) !== "no";
    const inclIntl = (inputs.includeInternational as string) !== "no";

    const portfolios: Record<string, { stocks: number; bonds: number; cash: number; intl: number; expectedReturn: number; volatility: string }> = {
      conservative: { stocks: 30, bonds: 50, cash: 20, intl: 10, expectedReturn: 5, volatility: "Low" },
      moderate: { stocks: 55, bonds: 30, cash: 15, intl: 15, expectedReturn: 7, volatility: "Medium" },
      aggressive: { stocks: 75, bonds: 15, cash: 10, intl: 20, expectedReturn: 9, volatility: "High" },
      very_aggressive: { stocks: 90, bonds: 5, cash: 5, intl: 25, expectedReturn: 10.5, volatility: "Very High" },
    };

    const profile = portfolios[risk] || portfolios.moderate;
    const expectedReturn = profile.expectedReturn;
    const r = expectedReturn / 100 / 12;
    const months = horizon * 12;

    const futureLump = amount * Math.pow(1 + r, months);
    const futureSIP = monthly * ((Math.pow(1 + r, months) - 1) / r) * (1 + r);
    const totalFuture = futureLump + futureSIP;
    const totalContributed = amount + monthly * months;

    const allocations: { label: string; value: number; color: string }[] = [
      { label: "US Stocks", value: profile.stocks - (inclIntl ? profile.intl * 0.5 : 0), color: "#6366f1" },
      ...(inclIntl ? [{ label: "International", value: profile.intl, color: "#06b6d4" }] : []),
      ...(inclBonds ? [{ label: "Bonds", value: profile.bonds, color: "#10b981" }] : []),
      { label: "Cash / MM", value: profile.cash, color: "#f59e0b" },
    ];

    const warnings: string[] = [];
    if (horizon < 3) warnings.push("Short horizon — consider a more conservative allocation.");
    if (risk === "very_aggressive" && horizon < 10) warnings.push("Very aggressive portfolio needs 10+ year horizon for risk to pay off.");
    if (monthly <= 0 && amount < 10000) warnings.push("Small portfolio without monthly additions will grow slowly.");
    if (!inclBonds && risk === "conservative") warnings.push("Conservative without bonds is unusual. Consider adding bonds.");

    return {
      summary: `${risk.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())} portfolio: ~${expectedReturn}% expected return. In ${horizon} years: ~$${Math.round(totalFuture).toLocaleString()}.`,
      metrics: [
        { label: "Initial Investment", value: `$${amount.toLocaleString()}`, isPositive: true },
        { label: "Expected Return", value: `${expectedReturn}%`, change: `${profile.volatility} volatility`, isPositive: true },
        { label: "Projected Value", value: `$${Math.round(totalFuture).toLocaleString()}`, change: `${horizon} years`, isPositive: true },
        { label: "Est. Growth", value: `$${Math.round(totalFuture - totalContributed).toLocaleString()}`, isPositive: true },
      ],
      sections: [
        {
          title: "Recommended Allocation",
          type: "chart",
          chartType: "donut",
          chartData: allocations.filter((a) => a.value > 0),
        },
        {
          title: "Allocation Breakdown",
          type: "table",
          headers: ["Asset Class", "Allocation %", "Amount"],
          rows: allocations.filter((a) => a.value > 0).map((a) => [
            a.label,
            `${Math.round(a.value)}%`,
            `$${Math.round(amount * a.value / 100).toLocaleString()}`,
          ]),
        },
        {
          title: "Portfolio Projection",
          type: "chart",
          chartType: "bar",
          chartData: Array.from({ length: Math.min(horizon, 10) }, (_, i) => {
            const y = i + 1;
            const m = y * 12;
            const fv = amount * Math.pow(1 + r, m) + monthly * ((Math.pow(1 + r, m) - 1) / r) * (1 + r);
            return { label: `Year ${y}`, value: Math.round(fv), color: "#6366f1" };
          }),
        },
      ],
      recommendations: [
        {
          priority: "high" as const,
          title: "Rebalance Annually",
          description: "Review and rebalance your portfolio once a year to maintain target allocation.",
          impact: "Improves risk-adjusted returns by 0.5-1%",
        },
        ...(risk === "conservative" || risk === "moderate" ? [{
          priority: "medium" as const,
          title: "Consider Dividend Stocks",
          description: "Add dividend-paying stocks for income generation while maintaining lower volatility.",
          impact: "Provides 2-4% dividend yield",
        }] : []),
        {
          priority: "medium" as const,
          title: "Use Low-Cost Index Funds",
          description: "Choose ETFs with <0.10% expense ratios. Fees compound and eat into returns over time.",
          impact: `Saves ~$${Math.round(totalFuture * 0.005).toLocaleString()} in fees over ${horizon} years`,
        },
        ...(monthly > 0 ? [{
          priority: "low" as const,
          title: "Automate Dollar-Cost Averaging",
          description: `Continue your $${monthly}/mo automated investments to benefit from market dips.`,
          impact: "Reduces timing risk significantly",
        }] : []),
      ],
      warnings,
    };
  },
};
