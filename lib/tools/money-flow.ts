import type { ToolDefinition } from "./types";

export const moneyFlow: ToolDefinition = {
  slug: "money-flow",
  name: "Money Flow Analyzer",
  description: "Visualize where your money comes from and where it goes each month.",
  icon: "ArrowLeftRight",
  category: "budgeting",
  isPremium: false,
  color: "emerald",
  fields: [
    { key: "salary", label: "Salary / Primary Income", type: "currency", required: true, defaultValue: 5500, group: "Income Sources", prefix: "$", min: 0 },
    { key: "sideIncome", label: "Side Income", type: "currency", required: false, defaultValue: 500, group: "Income Sources", prefix: "$", min: 0 },
    { key: "passiveIncome", label: "Passive Income", type: "currency", required: false, defaultValue: 200, group: "Income Sources", prefix: "$", min: 0 },
    { key: "fixedHousing", label: "Housing Costs", type: "currency", required: true, defaultValue: 1600, group: "Money Out", prefix: "$", min: 0 },
    { key: "fixedBills", label: "Bills & Utilities", type: "currency", required: true, defaultValue: 400, group: "Money Out", prefix: "$", min: 0 },
    { key: "livingExpenses", label: "Living Expenses", type: "currency", required: true, defaultValue: 1200, group: "Money Out", prefix: "$", min: 0 },
    { key: "discretionary", label: "Discretionary Spending", type: "currency", required: false, defaultValue: 600, group: "Money Out", prefix: "$", min: 0 },
    { key: "savingsTransfers", label: "Savings / Investments", type: "currency", required: false, defaultValue: 800, group: "Money Out", prefix: "$", min: 0 },
    { key: "debtPayments", label: "Debt Payments", type: "currency", required: false, defaultValue: 400, group: "Money Out", prefix: "$", min: 0 },
  ],
  calculate: (inputs) => {
    const salary = inputs.salary as number;
    const side = (inputs.sideIncome as number) || 0;
    const passive = (inputs.passiveIncome as number) || 0;
    const housing = inputs.fixedHousing as number;
    const bills = inputs.fixedBills as number;
    const living = inputs.livingExpenses as number;
    const disc = (inputs.discretionary as number) || 0;
    const savings = (inputs.savingsTransfers as number) || 0;
    const debt = (inputs.debtPayments as number) || 0;

    const totalIncome = salary + side + passive;
    const totalOutgoing = housing + bills + living + disc + savings + debt;
    const netFlow = totalIncome - totalOutgoing;
    const expenseRatio = ((totalOutgoing - savings - debt) / totalIncome) * 100;
    const savingsRate = ((savings + debt) / totalIncome) * 100;

    const warnings: string[] = [];
    if (netFlow < 0) warnings.push("Negative cash flow — you're spending more than you earn.");
    if (expenseRatio > 70) warnings.push("Expenses consume over 70% of income.");
    if (savingsRate < 10) warnings.push("Savings rate is below 10%.");
    if (debt > totalIncome * 0.2) warnings.push("Debt payments exceed 20% of income.");

    return {
      summary: `Your monthly cash flow: $${totalIncome.toLocaleString()} in, $${totalOutgoing.toLocaleString()} out. Net: $${netFlow.toLocaleString()}.`,
      metrics: [
        { label: "Total Income", value: `$${totalIncome.toLocaleString()}`, isPositive: true },
        { label: "Total Outgoing", value: `$${totalOutgoing.toLocaleString()}`, isPositive: false },
        { label: "Net Cash Flow", value: `$${netFlow.toLocaleString()}`, change: netFlow >= 0 ? "Positive" : "Negative", isPositive: netFlow >= 0 },
        { label: "Savings Rate", value: `${savingsRate.toFixed(1)}%`, isPositive: savingsRate >= 10 },
      ],
      sections: [
        {
          title: "Income Breakdown",
          type: "chart",
          chartType: "donut",
          chartData: [
            { label: "Salary", value: salary, color: "#6366f1" },
            ...(side > 0 ? [{ label: "Side Income", value: side, color: "#10b981" }] : []),
            ...(passive > 0 ? [{ label: "Passive Income", value: passive, color: "#06b6d4" }] : []),
          ],
        },
        {
          title: "Spending Breakdown",
          type: "chart",
          chartType: "bar",
          chartData: [
            { label: "Housing", value: housing, color: "#6366f1" },
            { label: "Bills", value: bills, color: "#8b5cf6" },
            { label: "Living", value: living, color: "#f59e0b" },
            { label: "Discretionary", value: disc, color: "#ef4444" },
            { label: "Savings", value: savings, color: "#10b981" },
            { label: "Debt", value: debt, color: "#f97316" },
          ],
        },
        {
          title: "Cash Flow Statement",
          type: "table",
          headers: ["Category", "Amount", "% of Income"],
          rows: [
            ["Income", `$${totalIncome.toLocaleString()}`, "100%"],
            ["Housing", `-$${housing.toLocaleString()}`, `${((housing / totalIncome) * 100).toFixed(1)}%`],
            ["Bills", `-$${bills.toLocaleString()}`, `${((bills / totalIncome) * 100).toFixed(1)}%`],
            ["Living", `-$${living.toLocaleString()}`, `${((living / totalIncome) * 100).toFixed(1)}%`],
            ["Discretionary", `-$${disc.toLocaleString()}`, `${((disc / totalIncome) * 100).toFixed(1)}%`],
            ["Savings", `-$${savings.toLocaleString()}`, `${((savings / totalIncome) * 100).toFixed(1)}%`],
            ["Debt", `-$${debt.toLocaleString()}`, `${((debt / totalIncome) * 100).toFixed(1)}%`],
            ["Net Flow", `$${netFlow.toLocaleString()}`, `${((netFlow / totalIncome) * 100).toFixed(1)}%`],
          ],
        },
      ],
      recommendations: [
        ...(netFlow < 0 ? [{
          priority: "high" as const,
          title: "Fix Negative Cash Flow",
          description: "You're spending more than you earn. Cut discretionary spending or increase income.",
          impact: `Need to reduce by $${Math.abs(netFlow).toLocaleString()}/mo`,
        }] : []),
        ...(savingsRate < 10 ? [{
          priority: "high" as const,
          title: "Increase Savings Rate",
          description: `Currently saving ${savingsRate.toFixed(1)}%. Aim for 20% of income.`,
          impact: `Target: $${Math.round(totalIncome * 0.2).toLocaleString()}/mo`,
        }] : []),
        ...(disc > totalIncome * 0.15 ? [{
          priority: "medium" as const,
          title: "Reduce Discretionary Spending",
          description: `Discretionary spending is ${((disc / totalIncome) * 100).toFixed(1)}% of income. Aim for under 15%.`,
          impact: `Could free $${Math.round(disc - totalIncome * 0.1).toLocaleString()}/mo`,
        }] : []),
        {
          priority: "low" as const,
          title: "Track Every Dollar for 30 Days",
          description: "Use a tracking app to identify spending leaks and patterns you might miss.",
          impact: "Usually reveals 5-15% in hidden savings",
        },
      ],
      warnings,
    };
  },
};
