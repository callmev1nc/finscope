"use client";

import { useState, useCallback } from "react";
import type { ToolDefinition, CalculationResult, ToolInputs } from "@/lib/tools/types";
import { generateSchema } from "@/lib/calculations/validators";
export function useCalculation(tool: ToolDefinition | undefined) {
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const calculate = useCallback(
    (inputs: ToolInputs): boolean => {
      if (!tool) return false;

      const schema = generateSchema(tool.fields);
      const parsed = schema.safeParse(inputs);

      if (!parsed.success) {
        const fieldErrors: Record<string, string> = {};
        for (const issue of parsed.error.issues) {
          const key = issue.path[0] as string;
          fieldErrors[key] = issue.message;
        }
        throw { fieldErrors };
      }

      setIsCalculating(true);

      try {
        const processedInputs: ToolInputs = {};
        for (const field of tool.fields) {
          const val = (parsed.data as Record<string, unknown>)[field.key];
          if (field.type === "currency" || field.type === "percentage" || field.type === "number") {
            processedInputs[field.key] = typeof val === "number" ? val : parseFloat(String(val ?? "")) || 0;
          } else {
            processedInputs[field.key] = typeof val === "string" ? val : String(val ?? "");
          }
        }

        const calcResult = tool.calculate(processedInputs);
        setResult(calcResult);
        return true;
      } catch (err) {
        console.error("Calculation error:", err);
        return false;
      } finally {
        setIsCalculating(false);
      }
    },
    [tool]
  );

  const reset = useCallback(() => {
    setResult(null);
  }, []);

  return { result, isCalculating, calculate, reset };
}
