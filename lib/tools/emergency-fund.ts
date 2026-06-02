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
    { key: "dependents", label: "Number of Dependents", type: "number", required: false, defaultValue: 0, group: "Risk Factors", min: 0 },
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
    const progress = targetAmount > 0 ? (current / targetAmount) * 100 : 0;

    // Nuanced risk assessment
    let riskLevel = 0; // 0-10 scale, higher = riskier
    if (stability === "unstable" || stability === "very_unstable") riskLevel += 3;
    else if (stability === "moderate") riskLevel += 1;
    if (dependents > 0) riskLevel += Math.min(3, dependents);
    if (insurance === "no") riskLevel += 2;
    else if (insurance === "minimal") riskLevel += 1;
    if (currentMonths < 1) riskLevel += 2;
    riskLevel = Math.min(10, riskLevel);

    const riskLabel = riskLevel >= 7 ? "High" : riskLevel >= 4 ? "Moderate" : "Low";

    // Time to goal display string
    const timeToGoalDisplay = monthly <= 0
      ? "Set a savings goal to begin"
      : shortfall <= 0
        ? "Already funded!"
        : `${monthsToGoal} months`;

    const warnings: string[] = [];
    if (monthly <= 0 && shortfall > 0) warnings.push("Set a monthly savings goal to start building your emergency fund.");
    if (currentMonths < 1) warnings.push("You have less than 1 month of expenses saved — immediate action needed.");
    if (currentMonths < 3) warnings.push("Aim for at least 3 months of expenses as a minimum safety net.");
    if (insurance === "no") warnings.push("Without health insurance, one medical emergency could be devastating.");
    if (dependents > 2) warnings.push("With multiple dependents, consider a larger emergency fund.");

    return {
      summary: `Target: $${targetAmount.toLocaleString()} (${recommendedMonths} months of expenses). Current: $${current.toLocaleString()} (${currentMonths.toFixed(1)} months). ` +
        `${shortfall > 0 ? `Need $${shortfall.toLocaleString()} more (${timeToGoalDisplay}).` : "Fully funded!"}`,
      metrics: [
        { label: "Current Savings", value: `$${current.toLocaleString()}`, change: `${currentMonths.toFixed(1)} months covered`, isPositive: currentMonths >= 1 },
        { label: "Target Amount", value: `$${targetAmount.toLocaleString()}`, change: `${recommendedMonths} months`, isPositive: false },
        { label: "Remaining Need", value: shortfall > 0 ? `$${shortfall.toLocaleString()}` : "$0", isPositive: shortfall === 0 },
        { label: "Goal Progress", value: `${Math.min(100, Math.round(progress))}%`, isPositive: progress >= 50 },
        { label: "Risk Level", value: `${riskLevel}/10`, change: riskLabel, isPositive: riskLevel <= 3 },
        { label: "Time to Goal", value: timeToGoalDisplay, isPositive: shortfall <= 0 || (monthsToGoal !== Infinity && monthsToGoal <= 12) },
      ],
      sections: [
        {
          title: "How Your Target Was Calculated",
          type: "table",
          headers: ["Factor", "Months Added"],
          rows: [
            ["Base (income stability)", `${baseMonths} months`],
            [`Dependents (${dependents})`, `+${dependentMonths} months`],
            ["Insurance status", `+${insuranceMonths} months`],
            ["Recommended Total", `${recommendedMonths} months`],
          ],
        },
        {
          title: "Risk Assessment",
          type: "table",
          headers: ["Risk Factor", "Impact", "Score"],
          rows: [
            ["Income stability", stability.replace("_", " "), stability === "unstable" || stability === "very_unstable" ? "High" : stability === "moderate" ? "Medium" : "Low"],
            ["Dependents", `${dependents} dependent(s)`, dependents > 2 ? "High" : dependents > 0 ? "Medium" : "Low"],
            ["Insurance", insurance === "no" ? "No coverage" : insurance === "minimal" ? "Minimal" : "Good", insurance === "no" ? "High" : insurance === "minimal" ? "Medium" : "Low"],
            ["Current buffer", `${currentMonths.toFixed(1)} months`, currentMonths < 1 ? "Critical" : currentMonths < 3 ? "Low" : "Adequate"],
            ["Overall Risk", riskLabel, `${riskLevel}/10`],
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
            [`Target (${recommendedMonths} months)`, `$${targetAmount.toLocaleString()}`],
            ["Monthly Contribution", `$${monthly.toLocaleString()}`],
            ["Time to Goal", timeToGoalDisplay],
          ],
        },
      ],
      recommendations: [
        {
          priority: "high" as const,
          title: "Keep Funds Accessible",
          description: "Store your emergency fund in a high-yield savings account (not stocks) for immediate access.",
          impact: "3.5-5% APY while staying liquid",
        },
        ...(shortfall > 0 && monthly > 0 ? [{
          priority: "high" as const,
          title: "Prioritize Building Your Emergency Fund",
          description: `You're $${shortfall.toLocaleString()} short of your ${recommendedMonths}-month target. This should be your #1 financial priority.`,
          impact: `Target: ${monthsToGoal} months at $${monthly}/mo`,
        }] : []),
        ...(shortfall > 0 && monthly <= 0 ? [{
          priority: "high" as const,
          title: "Set a Savings Goal",
          description: `You need $${shortfall.toLocaleString()} more but have no monthly savings set. Free up at least $${Math.ceil(shortfall / 24).toLocaleString()}/mo to reach your goal in 2 years.`,
          impact: `Minimum: $${Math.ceil(shortfall / 24).toLocaleString()}/mo`,
        }] : []),
        ...(currentMonths < 3 ? [{
          priority: "high" as const,
          title: "Reach 3-Month Minimum ASAP",
          description: `Focus on saving $${Math.max(0, expenses * 3 - current).toLocaleString()} to reach the 3-month minimum safety net.`,
          impact: "Protects against short-term income disruption",
        }] : []),
        ...(insurance !== "yes" ? [{
          priority: "medium" as const,
          title: "Get Health Insurance",
          description: "A medical emergency without insurance can wipe out savings. Explore affordable plans.",
          impact: "Reduces recommended fund by 1-2 months",
        }] : []),
        ...(riskLevel >= 5 ? [{
          priority: "medium" as const,
          title: "Reduce Your Risk Exposure",
          description: `Your overall risk score is ${riskLevel}/10. Consider increasing your fund target or reducing expenses to build a bigger buffer.`,
          impact: `Each additional month of savings reduces risk`,
        }] : []),
      ],
      warnings,
    };
  },
};
