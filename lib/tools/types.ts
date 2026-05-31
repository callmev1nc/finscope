export type FieldType = 'currency' | 'percentage' | 'number' | 'select' | 'text';
export type ToolCategory = 'budgeting' | 'investing' | 'debt' | 'income' | 'planning' | 'taxes';

export interface FieldDefinition {
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
  defaultValue?: number | string;
  min?: number;
  max?: number;
  step?: number;
  options?: { label: string; value: string }[];
  tooltip?: string;
  group?: string;
  prefix?: string;
  suffix?: string;
  placeholder?: string;
}

export interface Metric {
  label: string;
  value: string;
  change?: string;
  isPositive?: boolean;
  isCurrency?: boolean;
  isPercentage?: boolean;
}

export interface ResultSection {
  title: string;
  type: 'table' | 'chart' | 'text' | 'comparison';
  headers?: string[];
  rows?: (string | number)[][];
  chartType?: 'bar' | 'donut';
  chartData?: { label: string; value: number; color?: string }[];
  content?: string;
}

export interface Recommendation {
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact?: string;
}

export interface CalculationResult {
  summary: string;
  metrics: Metric[];
  sections: ResultSection[];
  recommendations: Recommendation[];
  warnings: string[];
}

export type ToolInputs = Record<string, number | string | undefined>;

export interface ToolMeta {
  slug: string;
  name: string;
  description: string;
  icon: string;
  category: ToolCategory;
  isPremium: boolean;
  color: string;
  fields: FieldDefinition[];
}

export interface ToolDefinition extends ToolMeta {
  calculate: (inputs: ToolInputs) => CalculationResult;
}
