import type { ToolDefinition } from "./types";

export const emergencyFund: ToolDefinition = {
  slug: "emergency-fund",
  name: "Emergency Fund Architect",
  description: "Determine the ideal emergency fund size and how to build it efficiently.",
  icon: "ShieldAlert",
  category: "budgeting",
  isPremium: false,
  color: "emerald",
  fields: [
    { key: "monthlyExpenses", label: "Monthly Essential Expenses", type: "currency", required: true, defaultValue: 3500, group: "Expenses", prefix: "$", min: 0 },
    { key: "currentSavings", label: "Current Emergency Savings", type: "currency", required: true, defaultValue: 5000, group: "Your Situation", prefix: "$", min: 0 },
    { key: "monthlySavings", label: "Monthly Savings You Can Add", type: "currency", required: true, defaultValue: 500, group: "Your Situation", prefix: "$", min: 0 },
    { key: "incomeStability", label: "Income Stability", type: "select", required: true, defaultValue: "medium", group: "Risk Factors", options: [{ label: "Very Stable (Govt/Tenured)", value: "very_stable" }, { label: "Stable (Permanent)", value: "stable" }, { label: "Moderate (Contract)", value: "moderate" }, { label: "Unstable (Freelance)", value: "unstable" }, { label: "Very Unstable (Gig)", value: "very_unstable" }] },
    { key: "dependents", label: "Number of Dependents", type: "number", required: false, defaultValue: 0, group: "Risk Factors", min: 0, max: 20 },
    { key: "hasInsurance", label: "Health Insurance?", type: "select", required: false, defaultValue: "yes", group: "Risk Factors", options: [{ label: "Yes, good coverage", value: "yes" }, { label: "Yes, minimal", value: "minimal" }, { label: "No insurance", value: "no" }] },
  ],
  calculate: (inputs) => {
    const expenses = inputs.monthlyExpenses as number;
    const current = inputs.currentSavings as number;
    const monthly = inputs.monthlySavings as number;
    const stability = inputs.incomeStability as string;
    const dependents = (inputs.dependents as number) || 0;
    const insurance = (inputs.hasInsurance as string) || "yes";

    const stabilityMonths: Record<string, number> = {
      very_stable: 3, stable: 4, moderate: 6, unstable: 9, very_unstable: 12,
    };

    const baseMonths = stabilityMonths[stability] || 6;
    const dependentMonths = dependents * 0.5;
    const insuranceMonths = insurance === "no" ? 2 : insurance === "minimal" ? 1 : 0;
    const recommendedMonths = Math.min(12, Math.round(baseMonths + dependentMonths + insuranceMonths));
    const targetAmount = expenses * recommendedMonths;
    const shortfall = Math.max(0, targetAmount - current);
    const monthsToGoal = monthly > 0 ? Math.ceil(shortfall / monthly) : Infinity;
    const currentMonths = expenses > 0 ? current / expenses : 0;
    const progress = (current / targetAmount) * 100;

    const warnings: string[] = [];
    if (currentMonths < 1) warnings.push("You have less than 1 month of expenses saved — immediate action needed.");
    if (currentMonths < 3) warnings.push("Aim for at least 3 months of expenses as a minimum safety net.");
    if (monthly <= 0) warnings.push("You need to free up some income to build this fund.");
    if (insurance === "no") warnings.push("Without health insurance, one medical emergency could be devastating.");
    if (dependents > 2) warnings.push("With multiple dependents, consider a larger emergency fund.");

    return {
      summary: `Target: $${targetAmount.toLocaleString()} (${recommendedMonths} months of expenses). Current: $${current.toLocaleString()} (${currentMonths.toFixed(1)} months). ` +
        `${shortfall > 0 ? `Need $${shortfall.toLocaleString()} more (${monthsToGoal === Infinity ? "N/A" : monthsToGoal + " months"}).` : "Fully funded!"}`,
      metrics: [
        { label: "Current Savings", value: `$${current.toLocaleString()}`, change: `${currentMonths.toFixed(1)} months covered`, isPositive: currentMonths >= 1 },
        { label: "Target Amount", value: `$${targetAmount.toLocaleString()}`, change: `${recommendedMonths} months`, isPositive: false },
        { label: "Remaining Need", value: shortfall > 0 ? `$${shortfall.toLocaleString()}` : "$0", isPositive: shortfall === 0 },
        { label: "Goal Progress", value: `${Math.min(100, Math.round(progress))}%`, isPositive: progress >= 50 },
      ],
      sections: [
        {
          title: "How Your Target Was Calculated",
          type: "table",
          headers: ["Factor", "Months Added"],
          rows: [
            ["Base (income stability)", `${baseMonths} months`],
            ["Dependents (${dependents})", `+${dependentMonths} months`],
            ["Insurance status", `+${insuranceMonths} months`],
            ["Recommended Total", `${recommendedMonths} months`],
          ],
        },
        {
          title: "Funding Timeline",
          type: "chart",
          chartType: "bar",
          chartData: [
            { label: "Current", value: current, color: "#6366f1" },
            { label: "Target", value: targetAmount, color: "#94a3b8" },
            { label: "Shortfall", value: shortfall, color: "#ef4444" },
          ],
        },
        {
          title: "Savings Plan",
          type: "table",
          headers: ["Metric", "Value"],
          rows: [
            ["Monthly Expenses", `$${expenses.toLocaleString()}`],
            ["Current Savings", `$${current.toLocaleString()}`],
            ["Target (${recommendedMonths} months)", `$${targetAmount.toLocaleString()}`],
            ["Monthly Contribution", `$${monthly.toLocaleString()}`],
            ["Time to Goal", monthsToGoal === Infinity ? "Increase savings" : `${monthsToGoal} months`],
          ],
        },
      ],
      recommendations: [
        ...(shortfall > 0 ? [{
          priority: "high" as const,
          title: "Prioritize Building Your Emergency Fund",
          description: `You're $${shortfall.toLocaleString()} short of your ${recommendedMonths}-month target. This should be your #1 financial priority.`,
          impact: monthsToGoal < Infinity ? `Target: ${monthsToGoal} months at $${monthly}/mo` : "",
        }] : []),
        ...(currentMonths < 3 ? [{
          priority: "high" as const,
          title: "Reach 3-Month Minimum ASAP",
          description: `Focus on saving $${(expenses * 3 - current).toLocaleString()} to reach the 3-month minimum safety net.`,
          impact: `Protects against short-term income disruption`,
        }] : []),
        {
          priority: "medium" as const,
          title: "Keep Funds Accessible",
          description: "Store your emergency fund in a high-yield savings account (not stocks) for immediate access.",
          impact: "3.5-5% APY while staying liquid",
        },
        ...(insurance !== "yes" ? [{
          priority: "medium" as const,
          title: "Get Health Insurance",
          description: "A medical emergency without insurance can wipe out savings. Explore affordable plans.",
          impact: "Reduces recommended fund by 1-2 months",
        }] : []),
      ],
      warnings,
    };
  },
};
