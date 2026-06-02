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
    const savingsRate = income > 0 ? (monthlySurplus / income) * 100 : 0;
    const isDeficit = totalExpenses > income;

    // Smarter proportional targets: cut more aggressively when in deficit
    const diningTarget = Math.round(diningOut * (isDeficit ? 0.45 : 0.6));
    const entertainmentTarget = Math.round(entertainment * (isDeficit ? 0.55 : 0.7));
    const shoppingTarget = Math.round(shopping * (isDeficit ? 0.4 : 0.5));
    // Subscription savings apply for any subscription amount > 0
    const subscriptionSavings = subscriptions > 0 ? Math.round(subscriptions * 0.3) : 0;

    const potentialSavings = (diningOut - diningTarget) + (entertainment - entertainmentTarget) + (shopping - shoppingTarget) + subscriptionSavings;

    // Spending health score (0-100)
    let healthScore = 100;
    if (isDeficit) healthScore -= 30;
    if (savingsRate < 10) healthScore -= 15;
    if (savingsRate < 0) healthScore -= 15;
    if (income > 0 && housing > income * 0.35) healthScore -= 10;
    if (diningOut > groceries && groceries > 0) healthScore -= 10;
    if (subscriptions > 100) healthScore -= 5;
    if (income > 0 && fixedExpenses > income * 0.5) healthScore -= 10;
    healthScore = Math.max(0, Math.min(100, healthScore));

    const healthLabel = healthScore >= 80 ? "Healthy" : healthScore >= 60 ? "Fair" : healthScore >= 40 ? "Needs Attention" : "Critical";

    const warnings: string[] = [];
    if (isDeficit) warnings.push(`You're overspending by $${Math.abs(monthlySurplus).toLocaleString()}/mo. This is unsustainable — cut expenses immediately.`);
    if (income > 0 && housing > income * 0.35) warnings.push("Housing costs exceed 35% of income — consider downsizing.");
    if (savingsRate < 10 && savingsRate >= 0) warnings.push("Your savings rate is below 10%. Look for areas to cut back.");
    if (diningOut > groceries && groceries > 0) warnings.push("You spend more on dining out than groceries. Consider cooking at home more.");
    if (subscriptions > 100) warnings.push(`You're spending $${subscriptions}/mo on subscriptions. Audit for unused services.`);

    const optimizationRows: (string | number)[][] = [
      diningOut > 0 ? ["Dining Out", `$${diningOut}`, `$${diningTarget}`, `$${diningOut - diningTarget}`] : ["Dining Out", "$0", "$0", "$0"],
      entertainment > 0 ? ["Entertainment", `$${entertainment}`, `$${entertainmentTarget}`, `$${entertainment - entertainmentTarget}`] : ["Entertainment", "$0", "$0", "$0"],
      shopping > 0 ? ["Shopping", `$${shopping}`, `$${shoppingTarget}`, `$${shopping - shoppingTarget}`] : ["Shopping", "$0", "$0", "$0"],
      subscriptions > 0 ? ["Subscriptions", `$${subscriptions}`, `$${subscriptions - subscriptionSavings}`, `$${subscriptionSavings}`] : ["Subscriptions", "$0", "$0", "$0"],
    ];

    const recommendations = [
      {
        priority: "high" as const,
        title: "Apply the 50/30/20 Rule",
        description: `Your needs (fixed expenses) are ${income > 0 ? ((fixedExpenses / income) * 100).toFixed(0) : "N/A"}% of income. Aim for 50% needs, 30% wants, 20% savings.`,
        impact: monthlySurplus > 0 ? `Currently saving ${savingsRate.toFixed(0)}%` : "Negative cash flow — focus on cutting wants first",
      },
      ...(isDeficit ? [{
        priority: "high" as const,
        title: "Urgent: Eliminate Your Deficit",
        description: `You need to cut $${Math.abs(monthlySurplus).toLocaleString()}/mo to break even. Start with the highest-impact categories: dining, shopping, and subscriptions.`,
        impact: `Target: reduce spending by $${Math.abs(monthlySurplus).toLocaleString()}/mo`,
      }] : []),
      ...(diningOut > 150 ? [{
        priority: "medium" as const,
        title: "Reduce Dining Out",
        description: `Cut dining out from $${diningOut}/mo to $${diningTarget}/mo by meal prepping and cooking at home.`,
        impact: `Saves $${(diningOut - diningTarget).toLocaleString()}/mo`,
      }] : []),
      ...(subscriptions > 0 ? [{
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
      ...(shopping > 200 ? [{
        priority: "medium" as const,
        title: "Curb Discretionary Shopping",
        description: `Your shopping is $${shopping}/mo. Apply a 48-hour rule before purchases and set a $${shoppingTarget}/mo cap.`,
        impact: `Saves $${(shopping - shoppingTarget).toLocaleString()}/mo`,
      }] : []),
    ];

    return {
      summary: isDeficit
        ? `WARNING: Spending $${totalExpenses.toLocaleString()}/mo exceeds income by $${Math.abs(monthlySurplus).toLocaleString()}. Health score: ${healthScore}/100 (${healthLabel}). Cut $${Math.abs(monthlySurplus).toLocaleString()}/mo to break even.`
        : `Total monthly expenses: $${totalExpenses.toLocaleString()} (${income > 0 ? ((totalExpenses / income) * 100).toFixed(0) : "N/A"}% of income). Health score: ${healthScore}/100 (${healthLabel}). You could save $${potentialSavings.toLocaleString()}/mo by optimizing.`,
      metrics: [
        { label: "Total Expenses", value: `$${totalExpenses.toLocaleString()}`, isPositive: !isDeficit },
        { label: "Monthly Surplus", value: `$${Math.max(0, monthlySurplus).toLocaleString()}`, change: monthlySurplus < 0 ? `Deficit: -$${Math.abs(monthlySurplus).toLocaleString()}` : "Healthy", isPositive: monthlySurplus >= 0 },
        { label: "Savings Rate", value: `${savingsRate.toFixed(1)}%`, isPositive: savingsRate >= 10 },
        { label: "Spending Health", value: `${healthScore}/100`, change: healthLabel, isPositive: healthScore >= 60 },
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
          rows: optimizationRows,
        },
        ...(isDeficit ? [{
          title: "Deficit Action Plan",
          type: "table" as const,
          headers: ["Priority", "Action", "Savings"],
          rows: [
            diningOut > 0 ? ["1", `Cut dining to $${diningTarget}/mo`, `$${diningOut - diningTarget}`] : ["1", "Dining: N/A", "$0"],
            shopping > 0 ? ["2", `Reduce shopping to $${shoppingTarget}/mo`, `$${shopping - shoppingTarget}`] : ["2", "Shopping: N/A", "$0"],
            entertainment > 0 ? ["3", `Reduce entertainment to $${entertainmentTarget}/mo`, `$${entertainment - entertainmentTarget}`] : ["3", "Entertainment: N/A", "$0"],
            subscriptions > 0 ? ["4", `Audit subscriptions (save 30%)`, `$${subscriptionSavings}`] : ["4", "Subscriptions: N/A", "$0"],
            ["Total", "Combined cuts", `$${potentialSavings}`],
          ],
        }] : []),
      ],
      recommendations,
      warnings,
    };
  },
};
