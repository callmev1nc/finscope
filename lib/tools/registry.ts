import type { ToolDefinition, ToolMeta } from "./types";
import { salaryAllocation } from "./salary-allocation";
import { expenseOptimization } from "./expense-optimization";
import { debtElimination } from "./debt-elimination";
import { moneyFlow } from "./money-flow";
import { paycheckInvesting } from "./paycheck-investing";
import { lifestyleUpgrade } from "./lifestyle-upgrade";
import { sideHustle } from "./side-hustle";
import { emergencyFund } from "./emergency-fund";
import { wealthGrowth } from "./wealth-growth";
import { incomeExpansion } from "./income-expansion";
import { skillToIncome } from "./skill-to-income";
import { financialFreedom } from "./financial-freedom";
import { investmentPortfolio } from "./investment-portfolio";
import { netWorthSimulator } from "./net-worth-simulator";
import { taxOptimization } from "./tax-optimization";

const toolList: ToolDefinition[] = [
  salaryAllocation,
  moneyFlow,
  wealthGrowth,
  debtElimination,
  paycheckInvesting,
  financialFreedom,
  lifestyleUpgrade,
  incomeExpansion,
  skillToIncome,
  sideHustle,
  expenseOptimization,
  investmentPortfolio,
  netWorthSimulator,
  taxOptimization,
  emergencyFund,
];

const tools = new Map<string, ToolDefinition>();
for (const tool of toolList) {
  tools.set(tool.slug, tool);
}

export function registerTool(tool: ToolDefinition) {
  tools.set(tool.slug, tool);
}

export function getTool(slug: string): ToolDefinition | undefined {
  return tools.get(slug);
}

export function getAllTools(): ToolDefinition[] {
  return Array.from(tools.values());
}

export function getToolsByCategory(category: string): ToolDefinition[] {
  return Array.from(tools.values()).filter((t) => t.category === category);
}

export function getFreeTools(): ToolDefinition[] {
  return Array.from(tools.values()).filter((t) => !t.isPremium);
}

export function getPremiumTools(): ToolDefinition[] {
  return Array.from(tools.values()).filter((t) => t.isPremium);
}

export function getAllToolMetas(): ToolMeta[] {
  return Array.from(tools.values()).map((tool) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { calculate, ...meta } = tool;
    return meta;
  });
}
