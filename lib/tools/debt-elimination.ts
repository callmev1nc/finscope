import type { ToolDefinition } from "./types";
import { debtPayoffMonths, totalInterestPaid } from "@/lib/calculations/finance-math";

export const debtElimination: ToolDefinition = {
  slug: "debt-elimination",
  name: "Debt Elimination Strategy",
  description: "Create a personalized plan to eliminate your debt faster using avalanche or snowball methods.",
  icon: "Shield",
  category: "debt",
  isPremium: false,
  color: "red",
  fields: [
    { key: "totalDebt", label: "Total Debt Balance", type: "currency", required: true, defaultValue: 15000, group: "Debt Overview", prefix: "$", min: 0 },
    { key: "interestRate", label: "Average Interest Rate (%)", type: "percentage", required: true, defaultValue: 18, group: "Debt Overview", min: 0, max: 50, suffix: "%" },
    { key: "minimumPayment", label: "Minimum Monthly Payment", type: "currency", required: true, defaultValue: 350, group: "Debt Overview", prefix: "$", min: 0 },
    { key: "extraPayment", label: "Extra Payment You Can Afford", type: "currency", required: false, defaultValue: 200, group: "Your Strategy", prefix: "$", min: 0 },
    { key: "monthlyIncome", label: "Monthly Income", type: "currency", required: true, defaultValue: 5000, group: "Your Strategy", prefix: "$", min: 0 },
  ],
  calculate: (inputs) => {
    const debt = inputs.totalDebt as number;
    const rate = inputs.interestRate as number;
    const minimum = inputs.minimumPayment as number;
    const extra = (inputs.extraPayment as number) || 0;
    const income = inputs.monthlyIncome as number;

    const totalMonthly = minimum + extra;
    const dti = (totalMonthly / income) * 100;

    const payoffMonthsStandard = debtPayoffMonths(debt, minimum, rate);
    const payoffMonthsAccelerated = debtPayoffMonths(debt, totalMonthly, rate);
    const interestStandard = totalInterestPaid(debt, minimum, rate, payoffMonthsStandard);
    const interestAccelerated = totalInterestPaid(debt, totalMonthly, rate, payoffMonthsAccelerated);
    const interestSaved = interestStandard - interestAccelerated;
    const monthsSaved = payoffMonthsStandard - payoffMonthsAccelerated;

    const warnings: string[] = [];
    if (dti > 40) warnings.push("Your debt-to-income ratio is over 40% — seek professional advice.");
    if (rate > 25) warnings.push("Your interest rate is very high. Consider debt consolidation.");
    if (minimum > income * 0.5) warnings.push("Minimum payments exceed 50% of income.");
    if (extra === 0) warnings.push("No extra payment allocated. Even $50/mo makes a difference.");

    return {
      summary: `With a total payment of $${totalMonthly.toLocaleString()}/mo, you can be debt-free in ${payoffMonthsAccelerated} months (${(payoffMonthsAccelerated / 12).toFixed(1)} years).`,
      metrics: [
        { label: "Total Debt", value: `$${debt.toLocaleString()}`, isPositive: false },
        { label: "Debt-to-Income Ratio", value: `${dti.toFixed(1)}%`, change: dti > 40 ? "High" : "Manageable", isPositive: dti <= 40 },
        { label: "Payoff Time (Standard)", value: `${payoffMonthsStandard} months`, change: `${(payoffMonthsStandard / 12).toFixed(1)} years`, isPositive: false },
        { label: "Payoff Time (Accelerated)", value: `${payoffMonthsAccelerated} months`, change: `${(payoffMonthsAccelerated / 12).toFixed(1)} years`, isPositive: true },
        { label: "Interest Saved", value: `$${Math.max(0, Math.round(interestSaved)).toLocaleString()}`, isPositive: true },
        { label: "Months Saved", value: `${monthsSaved} months`, isPositive: true },
      ],
      sections: [
        {
          title: "Payoff Comparison",
          type: "chart",
          chartType: "bar",
          chartData: [
            { label: "Standard (Min Only)", value: payoffMonthsStandard, color: "#ef4444" },
            { label: "Accelerated (+extra)", value: payoffMonthsAccelerated, color: "#10b981" },
          ],
        },
        {
          title: "Payment Breakdown",
          type: "table",
          headers: ["Scenario", "Monthly Payment", "Total Interest", "Payoff Time"],
          rows: [
            ["Minimum Only", `$${minimum.toLocaleString()}`, `$${Math.round(interestStandard).toLocaleString()}`, `${payoffMonthsStandard} mo`],
            ["Accelerated", `$${totalMonthly.toLocaleString()}`, `$${Math.round(interestAccelerated).toLocaleString()}`, `${payoffMonthsAccelerated} mo`],
            ["You Save", `+$${extra.toLocaleString()}`, `-$${Math.round(interestSaved).toLocaleString()}`, `-${monthsSaved} mo`],
          ],
        },
      ],
      recommendations: [
        {
          priority: "high" as const,
          title: "Use the Debt Avalanche Method",
          description: "Pay minimum on all debts and put extra money toward the highest-interest debt first. This saves the most money on interest.",
          impact: `Could save $${Math.round(interestSaved).toLocaleString()} in interest`,
        },
        ...(rate > 15 ? [{
          priority: "high" as const,
          title: "Consider Debt Consolidation",
          description: `Your ${rate}% APR is high. A balance transfer (0% for 12-18 months) or personal loan (8-12%) could save significantly.`,
          impact: `Potential savings: ${rate > 20 ? "30-50%" : "15-25%"} on interest`,
        }] : []),
        ...(extra === 0 ? [{
          priority: "medium" as const,
          title: "Find Extra Money for Debt",
          description: "Even $50-100/month extra can cut months off your payoff timeline. Consider a side hustle or cutting subscriptions.",
          impact: `With $100 extra: saves ${Math.round(debt / (minimum + 100))} months`,
        }] : []),
        {
          priority: "medium" as const,
          title: "Build a Small Emergency Fund First",
          description: "Save $1,000 before aggressively paying debt to avoid taking on new debt for emergencies.",
          impact: "Prevents further debt accumulation",
        },
        {
          priority: "low" as const,
          title: "Automate Your Payments",
          description: "Set up automatic payments to avoid late fees and reduce stress. Consider bi-weekly payments.",
          impact: "Reduces interest buildup between payments",
        },
      ],
      warnings,
    };
  },
};
