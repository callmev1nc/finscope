import type { ToolDefinition } from "./types";

export const salaryAllocation: ToolDefinition = {
  slug: "salary-allocation",
  name: "Salary Allocation Strategist",
  description: "Optimize how your salary is distributed across expenses, savings, investments, and debt for maximum financial growth.",
  icon: "Wallet",
  category: "budgeting",
  isPremium: false,
  color: "emerald",
  fields: [
    { key: "monthlySalary", label: "Monthly Salary (After Tax)", type: "currency", required: true, defaultValue: 5000, group: "Income", prefix: "$", min: 0 },
    { key: "rent", label: "Rent / Mortgage", type: "currency", required: true, defaultValue: 1500, group: "Expenses", prefix: "$", min: 0 },
    { key: "utilities", label: "Utilities & Bills", type: "currency", required: true, defaultValue: 300, group: "Expenses", prefix: "$", min: 0 },
    { key: "groceries", label: "Groceries & Food", type: "currency", required: true, defaultValue: 500, group: "Expenses", prefix: "$", min: 0 },
    { key: "transport", label: "Transportation", type: "currency", required: true, defaultValue: 200, group: "Expenses", prefix: "$", min: 0 },
    { key: "otherExpenses", label: "Other Expenses", type: "currency", required: false, defaultValue: 300, group: "Expenses", prefix: "$", min: 0 },
    { key: "currentSavings", label: "Current Savings (%)", type: "percentage", required: true, defaultValue: 10, group: "Goals", min: 0, max: 100, suffix: "%" },
    { key: "debtPayment", label: "Monthly Debt Payment", type: "currency", required: false, defaultValue: 0, group: "Goals", prefix: "$", min: 0 },
  ],
  calculate: (inputs) => {
    const salary = inputs.monthlySalary as number;
    const rent = inputs.rent as number;
    const utilities = inputs.utilities as number;
    const groceries = inputs.groceries as number;
    const transport = inputs.transport as number;
    const other = (inputs.otherExpenses as number) || 0;
    const savingsPct = (inputs.currentSavings as number) || 10;
    const debt = (inputs.debtPayment as number) || 0;

    const totalExpenses = rent + utilities + groceries + transport + other;
    const totalOutgoings = totalExpenses + debt;
    const suggestedSavings = salary * (savingsPct / 100);
    const remaining = salary - totalOutgoings - suggestedSavings;

    const savingsRate = ((salary - totalExpenses) / salary) * 100;
    const expenseRatio = (totalExpenses / salary) * 100;

    const recommendedSavings = salary * 0.20;
    const recommendedInvesting = salary * 0.10;
    const recommendedExpenses = salary * 0.50;
    const recommendedDebt = salary * 0.20;

    const warnings: string[] = [];
    if (expenseRatio > 70) warnings.push("Your expenses are over 70% of income — consider cutting non-essentials.");
    if (savingsRate < 10) warnings.push("Your savings rate is below 10%. Aim for at least 20%.");
    if (remaining < 0) warnings.push("You're spending more than you earn. Review your budget.");
    if (debt > salary * 0.3) warnings.push("Debt payments exceed 30% of income — high risk.");

    return {
      summary: `With a salary of $${salary.toLocaleString()}/mo, you can save $${suggestedSavings.toLocaleString()}/mo and have $${Math.max(0, remaining).toLocaleString()}/mo for discretionary spending.`,
      metrics: [
        { label: "Total Expenses", value: `$${totalExpenses.toLocaleString()}`, isPositive: false },
        { label: "Savings Rate", value: `${savingsRate.toFixed(1)}%`, change: expenseRatio > 70 ? "At risk" : "Healthy", isPositive: expenseRatio <= 70 },
        { label: "Monthly Savings", value: `$${suggestedSavings.toLocaleString()}`, isPositive: suggestedSavings > 0 },
        { label: "Discretionary", value: `$${Math.max(0, remaining).toLocaleString()}`, isPositive: remaining >= 0 },
      ],
      sections: [
        {
          title: "Recommended 50/30/20 Allocation",
          type: "chart",
          chartType: "donut",
          chartData: [
            { label: "Needs (50%)", value: recommendedExpenses, color: "#6366f1" },
            { label: "Savings (20%)", value: recommendedSavings, color: "#10b981" },
            { label: "Investments (10%)", value: recommendedInvesting, color: "#06b6d4" },
            { label: "Debt (20%)", value: recommendedDebt, color: "#f59e0b" },
          ],
        },
        {
          title: "Monthly Budget Breakdown",
          type: "table",
          headers: ["Category", "Amount", "% of Income"],
          rows: [
            ["Housing", `$${rent.toLocaleString()}`, `${((rent / salary) * 100).toFixed(1)}%`],
            ["Utilities", `$${utilities.toLocaleString()}`, `${((utilities / salary) * 100).toFixed(1)}%`],
            ["Food", `$${groceries.toLocaleString()}`, `${((groceries / salary) * 100).toFixed(1)}%`],
            ["Transport", `$${transport.toLocaleString()}`, `${((transport / salary) * 100).toFixed(1)}%`],
            ["Other", `$${other.toLocaleString()}`, `${((other / salary) * 100).toFixed(1)}%`],
            ["Debt", `$${debt.toLocaleString()}`, `${((debt / salary) * 100).toFixed(1)}%`],
          ],
        },
        {
          title: "Current vs. Recommended Allocation",
          type: "chart",
          chartType: "bar",
          chartData: [
            { label: "Expenses", value: expenseRatio, color: "#6366f1" },
            { label: "Target Expenses", value: 50, color: "#94a3b8" },
            { label: "Savings", value: savingsRate, color: "#10b981" },
            { label: "Target Savings", value: 20, color: "#94a3b8" },
          ],
        },
      ],
      recommendations: [
        ...(savingsRate < 20 ? [{
          priority: "high" as const,
          title: "Increase Savings Rate",
          description: `Your current savings rate is ${savingsRate.toFixed(1)}%. Aim for 20% ($${(salary * 0.2).toLocaleString()}/mo) by reducing discretionary spending.`,
          impact: `Could save $${((salary * 0.2 - suggestedSavings) * 12).toLocaleString()}/year more`,
        }] : []),
        ...(expenseRatio > 50 ? [{
          priority: "high" as const,
          title: "Reduce Expenses to 50% Target",
          description: `Your expenses are ${expenseRatio.toFixed(1)}% of income. Target is 50% ($${(salary * 0.5).toLocaleString()}/mo).`,
          impact: `Frees up $${((totalExpenses - salary * 0.5)).toLocaleString()}/mo`,
        }] : []),
        {
          priority: "medium" as const,
          title: "Build Emergency Fund First",
          description: "Before aggressive investing, save 3-6 months of expenses in a high-yield savings account.",
          impact: `Target: $${((totalExpenses + debt) * 6).toLocaleString()}`,
        },
        ...(debt > 0 ? [{
          priority: "high" as const,
          title: "Accelerate Debt Repayment",
          description: `You're paying $${debt.toLocaleString()}/mo toward debt. Consider the avalanche method (highest interest first).`,
          impact: `Debt-to-income ratio: ${((debt / salary) * 100).toFixed(1)}%`,
        }] : []),
      ],
      warnings,
    };
  },
};
