import type { ToolDefinition } from "./types";

export const lifestyleUpgrade: ToolDefinition = {
  slug: "lifestyle-upgrade",
  name: "Lifestyle Upgrade Planner",
  description: "Plan and budget for major lifestyle upgrades like a home, car, or dream vacation.",
  icon: "Home",
  category: "planning",
  isPremium: false,
  color: "amber",
  fields: [
    { key: "goalName", label: "Goal Name", type: "text", required: true, defaultValue: "Dream Home", group: "Goal", placeholder: "e.g. New Car, Vacation" },
    { key: "targetAmount", label: "Target Amount Needed", type: "currency", required: true, defaultValue: 50000, group: "Goal", prefix: "$", min: 0 },
    { key: "currentSaved", label: "Already Saved", type: "currency", required: false, defaultValue: 5000, group: "Goal", prefix: "$", min: 0 },
    { key: "monthlyContribution", label: "Monthly Contribution You Can Make", type: "currency", required: true, defaultValue: 800, group: "Savings Plan", prefix: "$", min: 0 },
    { key: "expectedReturn", label: "Expected Return on Savings (%)", type: "percentage", required: false, defaultValue: 4, group: "Savings Plan", min: 0, max: 20, suffix: "%" },
    { key: "timeframe", label: "Desired Timeframe (Years)", type: "number", required: false, defaultValue: 5, group: "Savings Plan", min: 0, max: 50 },
  ],
  calculate: (inputs) => {
    const goal = inputs.goalName as string;
    const target = inputs.targetAmount as number;
    const saved = (inputs.currentSaved as number) || 0;
    const monthly = inputs.monthlyContribution as number;
    const returnRate = (inputs.expectedReturn as number) || 4;
    const timeframe = (inputs.timeframe as number) || 5;

    const months = timeframe * 12;
    const r = returnRate / 100 / 12;
    const futureSaved = saved * Math.pow(1 + r, months);
    const futureFromContrib = monthly * ((Math.pow(1 + r, months) - 1) / r) * (1 + r);
    const projectedTotal = futureSaved + futureFromContrib;
    const shortfall = Math.max(0, target - projectedTotal);
    const missingPerMonth = shortfall > 0 ? (shortfall / months) * (1 + r) : 0;

    const monthsToGoal = monthly > 0
      ? Math.ceil(Math.log((monthly + r * (target - saved)) / monthly) / Math.log(1 + r))
      : 0;

    const onTrack = projectedTotal >= target;
    const percentComplete = (saved / target) * 100;

    const warnings: string[] = [];
    if (!onTrack) warnings.push(`At current pace, you'll be short by $${Math.round(shortfall).toLocaleString()}. Consider increasing contributions.`);
    if (monthly * months + saved < target * 0.5) warnings.push("You're less than 50% toward your goal. Consider a longer timeframe.");
    if (timeframe < 1) warnings.push("Very short savings horizon. Consider a high-yield savings account.");
    if (returnRate > 8) warnings.push("Expected return >8% is aggressive for savings goals. Be conservative.");

    return {
      summary: `${onTrack ? "On track!" : "Off track"} — for "${goal}", you need $${target.toLocaleString()}. Projected: $${Math.round(projectedTotal).toLocaleString()} in ${timeframe} years.`,
      metrics: [
        { label: "Target Amount", value: `$${target.toLocaleString()}`, isPositive: false },
        { label: "Already Saved", value: `$${saved.toLocaleString()}`, change: `${percentComplete.toFixed(0)}% of goal`, isPositive: true },
        { label: "Projected Total", value: `$${Math.round(projectedTotal).toLocaleString()}`, change: onTrack ? "On track" : `Short $${Math.round(shortfall).toLocaleString()}`, isPositive: onTrack },
        { label: "Time to Goal", value: monthsToGoal > 0 ? `${monthsToGoal} months` : "N/A", isPositive: monthsToGoal <= months },
      ],
      sections: [
        {
          title: "Savings Progress",
          type: "chart",
          chartType: "bar",
          chartData: [
            { label: "Saved So Far", value: saved, color: "#10b981" },
            { label: "Future Contributions", value: monthly * months, color: "#6366f1" },
            { label: "Target", value: target, color: "#94a3b8" },
          ],
        },
        {
          title: "Goal Breakdown",
          type: "table",
          headers: ["Metric", "Value"],
          rows: [
            ["Goal", goal],
            ["Target Amount", `$${target.toLocaleString()}`],
            ["Already Saved", `$${saved.toLocaleString()}`],
            ["Monthly Contribution", `$${monthly.toLocaleString()}`],
            ["Timeframe", `${timeframe} years`],
            ["Projected Total", `$${Math.round(projectedTotal).toLocaleString()}`],
            ["Monthly Shortfall", shortfall > 0 ? `$${Math.round(missingPerMonth).toLocaleString()}` : "$0"],
          ],
        },
      ],
      recommendations: [
        ...(!onTrack ? [{
          priority: "high" as const,
          title: "Increase Monthly Contribution",
          description: `Increase your monthly contribution by $${Math.round(missingPerMonth).toLocaleString()} to reach your goal on time.`,
          impact: `Total needed: $${Math.round(shortfall).toLocaleString()}`,
        }] : []),
        {
          priority: "medium" as const,
          title: "Use a High-Yield Savings Account",
          description: "Keep your savings in a HYSA (3.5-5% APY) instead of a regular checking account.",
          impact: `With ${returnRate}% return: +$${Math.round(futureSaved - saved + futureFromContrib - monthly * months).toLocaleString()}`,
        },
        ...(monthsToGoal > 0 && monthsToGoal > months ? [{
          priority: "low" as const,
          title: "Extend Your Timeframe",
          description: `Adding 1-2 more years reduces the monthly burden to $${Math.round((target - saved) / (months + 12)).toLocaleString()}.`,
          impact: "Reduces monthly pressure significantly",
        }] : []),
      ],
      warnings,
    };
  },
};
