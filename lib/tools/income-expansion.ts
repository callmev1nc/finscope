import type { ToolDefinition } from "./types";

export const incomeExpansion: ToolDefinition = {
  slug: "income-expansion",
  name: "Income Expansion Planner",
  description: "Discover strategies to grow your income through career advancement, side hustles, and passive income.",
  icon: "TrendingUp",
  category: "income",
  isPremium: false,
  color: "purple",
  fields: [
    { key: "currentIncome", label: "Current Annual Income", type: "currency", required: true, defaultValue: 75000, group: "Current Situation", prefix: "$", min: 0 },
    { key: "yearsExperience", label: "Years of Experience", type: "number", required: true, defaultValue: 5, group: "Current Situation", min: 0, max: 60 },
    { key: "industry", label: "Industry", type: "text", required: true, defaultValue: "Technology", group: "Current Situation" },
    { key: "skillLevel", label: "Current Skill Level", type: "select", required: true, defaultValue: "intermediate", group: "Growth Strategy", options: [{ label: "Beginner", value: "beginner" }, { label: "Intermediate", value: "intermediate" }, { label: "Advanced", value: "advanced" }, { label: "Expert", value: "expert" }] },
    { key: "hoursAvailable", label: "Hours/Week for Growth Activities", type: "number", required: true, defaultValue: 10, group: "Growth Strategy", min: 0, max: 40 },
    { key: "targetMultiplier", label: "Income Growth Target", type: "select", required: true, defaultValue: "1.5x", group: "Growth Strategy", options: [{ label: "1.5x (50% increase)", value: "1.5" }, { label: "2x (100% increase)", value: "2" }, { label: "3x (200% increase)", value: "3" }] },
  ],
  calculate: (inputs) => {
    const income = inputs.currentIncome as number;
    const experience = inputs.yearsExperience as number;
    const industry = inputs.industry as string;
    const skillLevel = inputs.skillLevel as string;
    const hours = inputs.hoursAvailable as number;
    const target = parseFloat(inputs.targetMultiplier as string);

    const targetIncome = income * target;
    const gap = targetIncome - income;

    const skillScores: Record<string, number> = { beginner: 1, intermediate: 2, advanced: 3, expert: 4 };
    const skillScore = skillScores[skillLevel] || 2;

    const promotionPotential = Math.min(40, experience * 3 + skillScore * 5);
    const sideHustlePotential = Math.min(50, hours * 3 + (skillScore - 1) * 5);
    const passivePotential = Math.min(30, (experience > 5 ? 15 : 5) + skillScore * 3);

    const strategies: { name: string; potential: number; timeline: string; effort: string }[] = [
      { name: "Promotion / Job Switch", potential: promotionPotential, timeline: "3-12 months", effort: "High" },
      { name: "Freelance / Consulting", potential: sideHustlePotential, timeline: "1-6 months", effort: "Medium" },
      { name: "Build Passive Income", potential: passivePotential, timeline: "12-36 months", effort: "Medium" },
      { name: "Skill Certification", potential: Math.min(30, experience * 2 + skillScore * 4), timeline: "2-8 months", effort: "High" },
      { name: "Networking / Personal Brand", potential: Math.min(20, experience * 2), timeline: "6-18 months", effort: "Low" },
    ];

    strategies.sort((a, b) => b.potential - a.potential);

    const warnings: string[] = [];
    if (gap <= 0) warnings.push("You're already at your target income. Set a higher goal!");
    if (hours < 5) warnings.push("Less than 5 hrs/week for growth will make progress slow.");
    if (experience < 2) warnings.push("Early in career — focus on skill-building over side hustles.");
    if (target > 2 && hours < 15) warnings.push("2x+ growth requires significant time investment.");

    return {
      summary: `To go from $${income.toLocaleString()} to $${targetIncome.toLocaleString()} (+${((target - 1) * 100).toFixed(0)}%), focus on: ${strategies[0].name} (${strategies[0].potential}% potential).`,
      metrics: [
        { label: "Current Income", value: `$${income.toLocaleString()}`, isPositive: false },
        { label: "Target Income", value: `$${targetIncome.toLocaleString()}`, isPositive: true },
        { label: "Income Gap", value: `$${gap.toLocaleString()}`, isPositive: false },
        { label: "Growth Potential Score", value: `${promotionPotential + sideHustlePotential + passivePotential}/120`, change: "Combined strategies", isPositive: true },
      ],
      sections: [
        {
          title: "Best Income Growth Strategies",
          type: "table",
          headers: ["Strategy", "Potential Score", "Timeline", "Effort"],
          rows: strategies.map((s) => [s.name, `${s.potential}/100`, s.timeline, s.effort]),
        },
        {
          title: "Strategy Comparison",
          type: "chart",
          chartType: "bar",
          chartData: strategies.map((s, i) => ({
            label: s.name.split(" ")[0],
            value: s.potential,
            color: ["#6366f1", "#10b981", "#06b6d4", "#f59e0b", "#8b5cf6"][i],
          })),
        },
      ],
      recommendations: [
        {
          priority: "high" as const,
          title: `Focus on ${strategies[0].name} (Score: ${strategies[0].potential}/100)`,
          description: strategies[0].name === "Promotion / Job Switch"
            ? `With ${experience} years in ${industry}, you're positioned for a promotion or move. Update your resume and network.`
            : strategies[0].name === "Freelance / Consulting"
            ? `Leverage your ${skillLevel} skills for freelance work at $${Math.round(income / 2000 * 1.5).toLocaleString()}/hr.`
            : `Invest time in building assets that generate income without active work.`,
          impact: `Could add $${Math.round(gap * 0.4).toLocaleString()}/yr on its own`,
        },
        ...(skillLevel !== "expert" ? [{
          priority: "high" as const,
          title: "Level Up Your Skills",
          description: `Moving from ${skillLevel} to the next level could increase your earning potential by 15-30%.`,
          impact: `Potential: +$${Math.round(income * 0.2).toLocaleString()}/yr`,
        }] : []),
        {
          priority: "medium" as const,
          title: "Build Multiple Income Streams",
          description: "Combine 2-3 strategies for faster growth. Don't rely on just one approach.",
          impact: `Combined top 3 strategies: ${strategies.slice(0, 3).reduce((s, x) => s + x.potential, 0)}/300`,
        },
      ],
      warnings,
    };
  },
};
