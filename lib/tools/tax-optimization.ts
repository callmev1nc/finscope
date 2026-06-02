import type { ToolDefinition } from "./types";

export const taxOptimization: ToolDefinition = {
  slug: "tax-optimization",
  name: "Tax Optimization Planner",
  description: "Identify tax-saving strategies and estimate your potential tax savings.",
  icon: "Receipt",
  category: "taxes",
  isPremium: false,
  color: "cyan",
  fields: [
    { key: "annualIncome", label: "Annual Gross Income", type: "currency", required: true, defaultValue: 100000, group: "Income", prefix: "$", min: 0 },
    { key: "filingStatus", label: "Filing Status", type: "select", required: true, defaultValue: "single", group: "Profile", options: [{ label: "Single", value: "single" }, { label: "Married Filing Jointly", value: "married_joint" }, { label: "Head of Household", value: "head_household" }] },
    { key: "state", label: "State", type: "text", required: false, defaultValue: "California", group: "Profile" },
    { key: "retirementContrib", label: "401(k) / Retirement Contributions", type: "currency", required: false, defaultValue: 15000, group: "Deductions", prefix: "$", min: 0 },
    { key: "hsaContrib", label: "HSA Contributions", type: "currency", required: false, defaultValue: 3000, group: "Deductions", prefix: "$", min: 0 },
    { key: "itemizedDeductions", label: "Itemized Deductions (Mortgage, Charity)", type: "currency", required: false, defaultValue: 10000, group: "Deductions", prefix: "$", min: 0 },
    { key: "selfEmployed", label: "Self-Employed? (Business Expenses)", type: "currency", required: false, defaultValue: 0, group: "Deductions", prefix: "$", min: 0 },
  ],
  calculate: (inputs) => {
    const income = inputs.annualIncome as number;
    const status = inputs.filingStatus as string;
    const retirement = (inputs.retirementContrib as number) || 0;
    const hsa = (inputs.hsaContrib as number) || 0;
    const itemized = (inputs.itemizedDeductions as number) || 0;
    const selfEmp = (inputs.selfEmployed as number) || 0;

    const standardDeductions: Record<string, number> = {
      single: 14600,
      married_joint: 29200,
      head_household: 21900,
    };

    const taxBrackets: Record<string, { min: number; max: number; rate: number }[]> = {
      single: [
        { min: 0, max: 11600, rate: 10 },
        { min: 11600, max: 47150, rate: 12 },
        { min: 47150, max: 100525, rate: 22 },
        { min: 100525, max: 191950, rate: 24 },
        { min: 191950, max: 243725, rate: 32 },
        { min: 243725, max: 609350, rate: 35 },
        { min: 609350, max: Infinity, rate: 37 },
      ],
      married_joint: [
        { min: 0, max: 23200, rate: 10 },
        { min: 23200, max: 94300, rate: 12 },
        { min: 94300, max: 201050, rate: 22 },
        { min: 201050, max: 383900, rate: 24 },
        { min: 383900, max: 487450, rate: 32 },
        { min: 487450, max: 731200, rate: 35 },
        { min: 731200, max: Infinity, rate: 37 },
      ],
      head_household: [
        { min: 0, max: 16550, rate: 10 },
        { min: 16550, max: 63100, rate: 12 },
        { min: 63100, max: 100500, rate: 22 },
        { min: 100500, max: 191950, rate: 24 },
        { min: 191950, max: 243700, rate: 32 },
        { min: 243700, max: 609350, rate: 35 },
        { min: 609350, max: Infinity, rate: 37 },
      ],
    };

    const brackets = taxBrackets[status] || taxBrackets.single;
    const standardDeduction = standardDeductions[status] || standardDeductions.single;

    // Progressive tax calculation function
    function calculateProgressiveTax(taxableIncome: number): number {
      if (taxableIncome <= 0) return 0;
      let tax = 0;
      for (const bracket of brackets) {
        if (taxableIncome <= bracket.min) break;
        const taxableInBracket = Math.min(taxableIncome, bracket.max) - bracket.min;
        tax += Math.max(0, taxableInBracket) * (bracket.rate / 100);
      }
      return tax;
    }

    // "Without optimization" = only standard deduction (no retirement, HSA, etc.)
    const baselineTaxable = Math.max(0, income - standardDeduction);
    const currentTax = calculateProgressiveTax(baselineTaxable);

    // "With optimization" = all deductions applied
    const totalDeductions = retirement + hsa + Math.max(itemized, standardDeduction) + selfEmp;
    const optimizedTaxable = Math.max(0, income - totalDeductions);
    const optimizedTax = calculateProgressiveTax(optimizedTaxable);

    const taxSavings = currentTax - optimizedTax;
    const effectiveRate = income > 0 ? (optimizedTax / income) * 100 : 0;
    const marginalRate = brackets.reduce((top, b) => {
      if (optimizedTaxable > b.min) return b.rate;
      return top;
    }, 0);

    const warnings: string[] = [];
    if (optimizedTaxable <= 0) warnings.push("Deductions exceed income — you may have net operating loss carryforward.");
    if (retirement < 23000 && income > 50000) warnings.push("Consider maxing 401(k) ($23,000 for 2024) for maximum tax benefit.");
    if (hsa < 4150 && income > 50000) warnings.push("HSA is triple tax-advantaged. Consider maxing it out ($4,150 individual / $8,300 family for 2024).");
    if (selfEmp > 0 && selfEmp < 2000) warnings.push("As self-employed, ensure you're capturing all eligible deductions (home office, equipment, vehicle).");
    if (itemized > 0 && itemized < standardDeduction) warnings.push("Itemized deductions are less than standard deduction. Use the standard deduction instead.");

    const bracketData = brackets.map((b) => {
      const currentTaxableInBracket = Math.min(Math.max(0, optimizedTaxable - b.min), b.max - b.min);
      return { label: `${b.rate}%`, value: Math.round(Math.max(0, currentTaxableInBracket * (b.rate / 100))), color: "" };
    });

    return {
      summary: `Estimated tax bill: $${Math.round(optimizedTax).toLocaleString()} (${effectiveRate.toFixed(1)}% effective rate, ${marginalRate}% marginal). You saved $${Math.round(taxSavings).toLocaleString()} through deductions.`,
      metrics: [
        { label: "Gross Income", value: `$${income.toLocaleString()}`, isPositive: true },
        { label: "Total Deductions", value: `$${totalDeductions.toLocaleString()}`, isPositive: true },
        { label: "Taxable Income", value: `$${optimizedTaxable.toLocaleString()}`, isPositive: true },
        { label: "Tax Bill", value: `$${Math.round(optimizedTax).toLocaleString()}`, change: `Effective: ${effectiveRate.toFixed(1)}% / Marginal: ${marginalRate}%`, isPositive: effectiveRate < 20 },
        { label: "Tax Savings", value: `$${Math.round(taxSavings).toLocaleString()}`, isPositive: taxSavings > 0 },
      ],
      sections: [
        {
          title: "Tax Breakdown by Bracket",
          type: "chart",
          chartType: "bar",
          chartData: bracketData.filter((b) => b.value > 0).map((b, i) => ({
            ...b,
            color: ["#6366f1", "#818cf8", "#06b6d4", "#10b981", "#f59e0b", "#f97316", "#ef4444"][i],
          })),
        },
        {
          title: "Tax Comparison",
          type: "table",
          headers: ["Scenario", "Income", "Deductions", "Taxable", "Tax Due"],
          rows: [
            ["Standard Deduction Only", `$${income.toLocaleString()}`, `$${standardDeduction.toLocaleString()}`, `$${baselineTaxable.toLocaleString()}`, `$${Math.round(currentTax).toLocaleString()}`],
            ["With Optimization", `$${income.toLocaleString()}`, `$${totalDeductions.toLocaleString()}`, `$${optimizedTaxable.toLocaleString()}`, `$${Math.round(optimizedTax).toLocaleString()}`],
            ["Savings", "", "", "", `$${Math.round(taxSavings).toLocaleString()}`],
          ],
        },
        {
          title: "Your Marginal Bracket Analysis",
          type: "table",
          headers: ["Bracket", "Taxable Amount", "Tax at Rate"],
          rows: brackets.map((b) => {
            const taxableInBracket = Math.min(Math.max(0, optimizedTaxable - b.min), b.max - b.min);
            const taxInBracket = Math.max(0, taxableInBracket) * (b.rate / 100);
            return [
              `${b.rate}% ($${b.min.toLocaleString()} - ${b.max === Infinity ? "+" : "$" + b.max.toLocaleString()})`,
              `$${Math.round(taxableInBracket).toLocaleString()}`,
              `$${Math.round(taxInBracket).toLocaleString()}`,
            ];
          }).filter((_, i) => {
            const taxableInBracket = Math.min(Math.max(0, optimizedTaxable - brackets[i].min), brackets[i].max - brackets[i].min);
            return taxableInBracket > 0;
          }),
        },
      ],
      recommendations: [
        ...(retirement < 23000 && income > 50000 ? [{
          priority: "high" as const,
          title: "Max Out Retirement Contributions",
          description: "Increase 401(k)/IRA contributions to the max ($23,000 for 2024, $30,500 if 50+). Every $1 contributed saves $0.10-0.37 in taxes.",
          impact: `Potential additional savings: $${Math.round(Math.max(0, 23000 - retirement) * (marginalRate / 100)).toLocaleString()}`,
        }] : []),
        ...(hsa < 4150 && income > 50000 ? [{
          priority: "high" as const,
          title: "Maximize HSA Contributions",
          description: "HSA is the most tax-advantaged account: pre-tax contributions, tax-free growth, tax-free withdrawals for medical expenses.",
          impact: `Triple tax savings on $${(4150 - hsa).toLocaleString()} more`,
        }] : []),
        {
          priority: "medium" as const,
          title: "Consider Tax-Loss Harvesting",
          description: "Sell underperforming investments to offset gains. Can save up to $3,000/year against ordinary income.",
          impact: "Reduces taxable income by up to $3,000",
        },
        ...(selfEmp > 0 ? [{
          priority: "medium" as const,
          title: "Maximize Business Deductions",
          description: "Track home office, equipment, software, travel, and meals. Consider a SEP-IRA for higher contribution limits ($69,000 for 2024).",
          impact: "Could increase deductions by 10-20%",
        }] : []),
        ...(marginalRate >= 24 ? [{
          priority: "medium" as const,
          title: "Explore Municipal Bonds",
          description: `At ${marginalRate}% marginal rate, tax-free municipal bond interest may outperform taxable bonds after taxes.`,
          impact: `Tax-equivalent yield boost of ${marginalRate}%`,
        }] : []),
        ...(income > 200000 ? [{
          priority: "low" as const,
          title: "Consider Roth Conversion Strategy",
          description: "If you expect lower income in future years, convert traditional IRA funds to Roth in lower-income years.",
          impact: "Long-term tax-free growth",
        }] : []),
      ],
      warnings,
    };
  },
};
