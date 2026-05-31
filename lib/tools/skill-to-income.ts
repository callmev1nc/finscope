import type { ToolDefinition } from "./types";

export const skillToIncome: ToolDefinition = {
  slug: "skill-to-income",
  name: "Skill to Income Converter",
  description: "See how learning a new skill can translate into real income based on market rates.",
  icon: "BookOpen",
  category: "income",
  isPremium: true,
  color: "purple",
  fields: [
    { key: "skillName", label: "Skill You Want to Learn", type: "text", required: true, defaultValue: "Web Development", group: "Skill Details" },
    { key: "skillCategory", label: "Skill Category", type: "select", required: true, defaultValue: "tech", group: "Skill Details", options: [{ label: "Technology", value: "tech" }, { label: "Creative", value: "creative" }, { label: "Business", value: "business" }, { label: "Trade", value: "trade" }, { label: "Health & Wellness", value: "health" }] },
    { key: "learningMonths", label: "Months to Learn (Basic Proficiency)", type: "number", required: true, defaultValue: 6, group: "Learning Path", min: 1, max: 48 },
    { key: "hoursPerWeek", label: "Hours Per Week for Learning", type: "number", required: true, defaultValue: 10, group: "Learning Path", min: 1, max: 60 },
    { key: "courseCost", label: "Estimated Course/Training Cost", type: "currency", required: false, defaultValue: 2000, group: "Learning Path", prefix: "$", min: 0 },
    { key: "currentHourlyRate", label: "Current Hourly Rate (if applicable)", type: "currency", required: false, defaultValue: 25, group: "Income Potential", prefix: "$", min: 0 },
  ],
  calculate: (inputs) => {
    const skill = inputs.skillName as string;
    const category = inputs.skillCategory as string;
    const learning = inputs.learningMonths as number;
    const hours = inputs.hoursPerWeek as number;
    const cost = (inputs.courseCost as number) || 0;
    const currentRate = (inputs.currentHourlyRate as number) || 0;

    const categoryRates: Record<string, { entry: number; mid: number; senior: number }> = {
      tech: { entry: 30, mid: 65, senior: 120 },
      creative: { entry: 25, mid: 50, senior: 90 },
      business: { entry: 35, mid: 60, senior: 100 },
      trade: { entry: 20, mid: 40, senior: 65 },
      health: { entry: 25, mid: 45, senior: 75 },
    };

    const rates = categoryRates[category] || categoryRates.tech;
    const entryRate = currentRate > 0 ? Math.max(currentRate, rates.entry) : rates.entry;
    const monthlyFreelanceHours = hours * 4.33 * 0.5;
    const entryMonthly = entryRate * monthlyFreelanceHours;
    const roi = cost > 0 ? ((entryMonthly * 12 - cost) / cost) * 100 : 0;
    const breakEvenMonths = cost > 0 ? Math.ceil(cost / entryMonthly) : 0;
    const totalHours = learning * 4.33 * hours;

    const warnings: string[] = [];
    if (cost > entryMonthly * 3) warnings.push("Training cost is high. Look for free/affordable alternatives first.");
    if (learning > 12) warnings.push("Learning timeline > 12 months. Consider breaking into smaller certifications.");
    if (hours < 5) warnings.push("Less than 5 hrs/week will significantly slow progress.");
    if (entryRate <= currentRate) warnings.push("Entry rate for this skill is similar to your current rate. Aim for mid-level.");

    return {
      summary: `Learning ${skill} (${category}) could earn $${entryRate}/hr entry-level → $${entryMonthly.toLocaleString()}/mo freelancing. Break-even: ${breakEvenMonths} months.`,
      metrics: [
        { label: "Entry-Level Rate", value: `$${entryRate}/hr`, isPositive: entryRate > currentRate },
        { label: "Mid-Level Rate", value: `$${rates.mid}/hr`, isPositive: true },
        { label: "Senior Rate", value: `$${rates.senior}/hr`, isPositive: true },
        { label: "Entry Monthly (Freelance)", value: `$${Math.round(entryMonthly).toLocaleString()}`, isPositive: true },
        { label: "ROI (First Year)", value: `${Math.round(roi)}%`, isPositive: roi > 0 },
        { label: "Break-Even", value: breakEvenMonths > 0 ? `${breakEvenMonths} months` : "N/A", isPositive: breakEvenMonths <= 6 },
      ],
      sections: [
        {
          title: "Income Progression",
          type: "chart",
          chartType: "bar",
          chartData: [
            { label: "Entry", value: entryRate, color: "#6366f1" },
            { label: "Mid", value: rates.mid, color: "#10b981" },
            { label: "Senior", value: rates.senior, color: "#06b6d4" },
          ],
        },
        {
          title: "Learning Investment Analysis",
          type: "table",
          headers: ["Metric", "Value"],
          rows: [
            ["Skill", skill],
            ["Category", category.charAt(0).toUpperCase() + category.slice(1)],
            ["Learning Time", `${learning} months`],
            ["Total Study Hours", `${Math.round(totalHours)} hours`],
            ["Training Cost", `$${cost.toLocaleString()}`],
            ["Entry Rate", `$${entryRate}/hr`],
            ["Est. Monthly (Freelance)", `$${Math.round(entryMonthly).toLocaleString()}`],
            ["First Year ROI", `${Math.round(roi)}%`],
          ],
        },
      ],
      recommendations: [
        ...(cost > 500 ? [{
          priority: "high" as const,
          title: "Start with Free Resources",
          description: "Before paying for courses, explore free alternatives (YouTube, documentation, open-source projects) to validate interest.",
          impact: `Saves $${cost.toLocaleString()} upfront`,
        }] : []),
        {
          priority: "high" as const,
          title: "Build a Portfolio While Learning",
          description: "Apply each concept by building real projects. A portfolio is worth more than certificates.",
          impact: "Increases hireability by 3x",
        },
        ...(learning > 6 ? [{
          priority: "medium" as const,
          title: "Set Milestone Goals",
          description: `Break the ${learning}-month plan into monthly milestones with measurable outcomes.`,
          impact: "Keeps motivation high",
        }] : []),
        {
          priority: "medium" as const,
          title: "Freelance at Entry Rate First",
          description: "Start freelancing at entry rates to build experience, reviews, and confidence before raising prices.",
          impact: `First goal: $${Math.round(entryMonthly).toLocaleString()}/mo`,
        },
      ],
      warnings,
    };
  },
};
