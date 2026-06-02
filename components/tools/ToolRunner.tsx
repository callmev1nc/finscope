"use client";

import type { ToolDefinition } from "@/lib/tools/types";
import { ToolForm } from "./ToolForm";
import { ResultReport } from "./ResultReport";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useToolForm } from "@/hooks/useToolForm";
import { useCalculation } from "@/hooks/useCalculation";
import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Lock } from "lucide-react";
import Link from "next/link";
import { decodeInputs } from "@/lib/share/encoder";

interface FieldErrors {
  fieldErrors?: Record<string, string>;
}

interface ToolRunnerProps {
  tool: ToolDefinition;
  initialInputs?: Record<string, number | string | undefined>;
  encodedData?: string;
}

const categoryLabels: Record<string, string> = {
  budgeting: "Budgeting",
  investing: "Investing",
  debt: "Debt",
  income: "Income",
  planning: "Planning",
  taxes: "Taxes",
};

export function ToolRunner({ tool, initialInputs, encodedData }: ToolRunnerProps) {
  const form = useToolForm(tool.fields);
  const calc = useCalculation(tool);
  const [showResult, setShowResult] = useState(false);
  const initialRun = useRef(false);

  // Auto-calculate on mount when sharing (run once only)
  useEffect(() => {
    if (initialRun.current) return;
    const inputs = initialInputs || (encodedData ? decodeInputs(encodedData) : null);
    if (!inputs) return;

    initialRun.current = true;
    form.setAllValues(inputs);
    try {
      calc.calculate(inputs);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time init from shared URL data
      setShowResult(true);
    } catch {
      // validation errors on shared data — show form instead
    }
  }, [initialInputs, encodedData, form, calc]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const success = calc.calculate(form.values);
      if (success) {
        setShowResult(true);
      }
    } catch (err) {
      const fieldErr = (err as FieldErrors).fieldErrors;
      if (fieldErr) {
        for (const [key, msg] of Object.entries(fieldErr)) {
          form.setErrors((prev: Record<string, string>) => ({ ...prev, [key]: msg }));
        }
      }
    }
  };

  const handleReset = () => {
    form.reset();
    calc.reset();
    setShowResult(false);
  };

  if (tool.isPremium) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-purple-100 dark:from-amber-900/30 dark:to-purple-900/30 mb-6">
          <Lock className="h-8 w-8 text-purple-600 dark:text-purple-400" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Premium Tool</h2>
        <p className="text-zinc-500 dark:text-zinc-400 max-w-md mb-6">
          {tool.name} is a premium tool. Upgrade to unlock all premium features.
        </p>
        <Link
          href="/pricing"
          className="inline-flex h-11 items-center justify-center rounded-lg bg-gradient-to-r from-primary to-secondary px-6 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90"
        >
          View Pricing
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to tools
      </Link>

      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold tracking-tight">{tool.name}</h1>
          <Badge variant={tool.isPremium ? "premium" : "default"}>
            {tool.isPremium ? "Premium" : "Free"}
          </Badge>
        </div>
        <p className="text-zinc-500 dark:text-zinc-400">{tool.description}</p>
        <span className="inline-block mt-2 text-xs text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-full">
          {categoryLabels[tool.category] || tool.category}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Input Details</CardTitle>
            </CardHeader>
            <CardContent>
              <ToolForm
                fields={tool.fields}
                values={form.values}
                errors={form.errors}
                isCalculating={calc.isCalculating}
                onChange={form.handleChange}
                onSubmit={handleSubmit}
                onReset={handleReset}
              />
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-3">
          {showResult && calc.result ? (
            <ResultReport
              result={calc.result}
              toolSlug={tool.slug}
              toolName={tool.name}
              inputs={form.values}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-border rounded-xl">
              <p className="text-zinc-400 text-lg">
                Fill in your details and click Calculate
              </p>
              <p className="text-zinc-300 dark:text-zinc-600 text-sm mt-1">
                Get your personalized financial plan instantly
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
