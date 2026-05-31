import type { ToolDefinition } from "./types";

export const expenseOptimization: ToolDefinition = {
  slug: "expense-optimization",
  name: "Expense Optimization Engine",
  description: "Analyze your spending patterns and find opportunities to cut costs and save more.",
  icon: "PiggyBank",
  category: "budgeting",
  isPremium: false,
  color: "emerald",
  fields: [
    { key: "monthlyIncome", label: "Monthly Income", type: "currency", required: true, defaultValue: 6000, group: "Income", prefix: "$", min: 0 },
    { key: "housing", label: "Housing (Rent/Mortgage)", type: "currency", required: true, defaultValue: 1800, group: "Fixed Expenses", prefix: "$", min: 0 },
    { key: "utilities", label: "Utilities", type: "currency", required: true, defaultValue: 250, group: "Fixed Expenses", prefix: "$", min: 0 },
    { key: "insurance", label: "Insurance", type: "currency", required: false, defaultValue: 150, group: "Fixed Expenses", prefix: "$", min: 0 },
    { key: "groceries", label: "Groceries", type: "currency", required: true, defaultValue: 600, group: "Variable Expenses", prefix: "$", min: 0 },
    { key: "diningOut", label: "Dining Out", type: "currency", required: true, defaultValue: 300, group: "Variable Expenses", prefix: "$", min: 0 },
    { key: "entertainment", label: "Entertainment", type: "currency", required: false, defaultValue: 200, group: "Variable Expenses", prefix: "$", min: 0 },
    { key: "shopping", label: "Shopping", type: "currency", required: false, defaultValue: 250, group: "Variable Expenses", prefix: "$", min: 0 },
    { key: "subscriptions", label: "Subscriptions", type: "currency", required: false, defaultValue: 80, group: "Variable Expenses", prefix: "$", min: 0 },
    { key: "transport", label: "Transportation", type: "currency", required: false, defaultValue: 200, group: "Variable Expenses", prefix: "$", min: 0 },
  ],
  calculate: (inputs) => {
    const income = inputs.monthlyIncome as number;
    const housing = inputs.housing as number;
    const utilities = inputs.utilities as number;
    const insurance = (inputs.insurance as number) || 0;
    const groceries = inputs.groceries as number;
    const diningOut = inputs.diningOut as number;
    const entertainment = (inputs.entertainment as number) || 0;
    const shopping = (inputs.shopping as number) || 0;
    const subscriptions = (inputs.subscriptions as number) || 0;
    const transport = (inputs.transport as number) || 0;

    const fixedExpenses = housing + utilities + insurance;
    const variableExpenses = groceries + diningOut + entertainment + shopping + subscriptions + transport;
    const totalExpenses = fixedExpenses + variableExpenses;
    const monthlySurplus = income - totalExpenses;
    const savingsRate = (monthlySurplus / income) * 100;

    const diningTarget = Math.round(diningOut * 0.6);
    const entertainmentTarget = Math.round(entertainment * 0.7);
    const shoppingTarget = Math.round(shopping * 0.5);
    const subscriptionSavings = subscriptions > 50 ? Math.round(subscriptions * 0.4) : 0;
    const potentialSavings = (diningOut - diningTarget) + (entertainment - entertainmentTarget) + (shopping - shoppingTarget) + subscriptionSavings;

    const warnings: string[] = [];
    if (totalExpenses > income) warnings.push("You're spending more than you earn each month.");
    if (housing > income * 0.35) warnings.push("Housing costs exceed 35% of income — consider downsizing.");
    if (savingsRate < 10) warnings.push("Your savings rate is below 10%. Look for areas to cut back.");
    if (diningOut > groceries) warnings.push("You spend more on dining out than groceries. Consider cooking at home more.");

    return {
      summary: `Total monthly expenses: $${totalExpenses.toLocaleString()} (${((totalExpenses / income) * 100).toFixed(0)}% of income). You could save $${potentialSavings.toLocaleString()}/mo by optimizing variable expenses.`,
      metrics: [
        { label: "Total Expenses", value: `$${totalExpenses.toLocaleString()}`, isPositive: false },
        { label: "Monthly Surplus", value: `$${Math.max(0, monthlySurplus).toLocaleString()}`, change: monthlySurplus < 0 ? "Deficit" : "Healthy", isPositive: monthlySurplus >= 0 },
        { label: "Savings Rate", value: `${savingsRate.toFixed(1)}%`, isPositive: savingsRate >= 10 },
        { label: "Potential Savings", value: `$${potentialSavings.toLocaleString()}/mo`, change: `$${(potentialSavings * 12).toLocaleString()}/yr`, isPositive: true },
      ],
      sections: [
        {
          title: "Spending Breakdown",
          type: "chart",
          chartType: "donut",
          chartData: [
            { label: "Housing", value: housing, color: "#6366f1" },
            { label: "Utilities & Insurance", value: utilities + insurance, color: "#8b5cf6" },
            { label: "Groceries", value: groceries, color: "#10b981" },
            { label: "Dining Out", value: diningOut, color: "#f59e0b" },
            { label: "Entertainment", value: entertainment, color: "#ef4444" },
            { label: "Shopping", value: shopping, color: "#ec4899" },
            { label: "Subscriptions", value: subscriptions, color: "#06b6d4" },
            { label: "Transport", value: transport, color: "#f97316" },
          ],
        },
        {
          title: "Optimization Opportunity",
          type: "table",
          headers: ["Category", "Current", "Target", "Savings"],
          rows: [
            diningOut > 0 ? ["Dining Out", `$${diningOut}`, `$${diningTarget}`, `$${diningOut - diningTarget}`] : ["Dining Out", "$0", "$0", "$0"],
            entertainment > 0 ? ["Entertainment", `$${entertainment}`, `$${entertainmentTarget}`, `$${entertainment - entertainmentTarget}`] : ["Entertainment", "$0", "$0", "$0"],
            shopping > 0 ? ["Shopping", `$${shopping}`, `$${shoppingTarget}`, `$${shopping - shoppingTarget}`] : ["Shopping", "$0", "$0", "$0"],
            subscriptions > 50 ? ["Subscriptions", `$${subscriptions}`, `$${subscriptions - subscriptionSavings}`, `$${subscriptionSavings}`] : ["Subscriptions", "$0", "$0", "$0"],
          ],
        },
      ],
      recommendations: [
        {
          priority: "high" as const,
          title: "Apply the 50/30/20 Rule",
          description: `Your needs (fixed expenses) are ${((fixedExpenses / income) * 100).toFixed(0)}% of income. Aim for 50% needs, 30% wants, 20% savings.`,
          impact: monthlySurplus > 0 ? `Currently saving ${savingsRate.toFixed(0)}%` : "Negative cash flow",
        },
        ...(diningOut > 200 ? [{
          priority: "medium" as const,
          title: "Reduce Dining Out",
          description: `Cut dining out from $${diningOut}/mo to $${diningTarget}/mo by meal prepping and cooking at home.`,
          impact: `Saves $${(diningOut - diningTarget).toLocaleString()}/mo`,
        }] : []),
        ...(subscriptions > 50 ? [{
          priority: "low" as const,
          title: "Audit Subscriptions",
          description: `Review your $${subscriptions}/mo in subscriptions. Cancel unused ones and share family plans.`,
          impact: `Potential savings: $${subscriptionSavings}/mo`,
        }] : []),
        ...(transport > 200 ? [{
          priority: "low" as const,
          title: "Optimize Transportation",
          description: "Consider public transit, carpooling, or biking to reduce transportation costs.",
          impact: "Could save 20-40% on transport",
        }] : []),
      ],
      warnings,
    };
  },
};
