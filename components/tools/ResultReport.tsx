"use client";

import type { CalculationResult, ToolInputs } from "@/lib/tools/types";
import { MetricCard } from "./MetricCard";
import { ResultTable } from "./ResultTable";
import { BarChart } from "./BarChart";
import { DonutChart } from "./DonutChart";
import { Recommendations } from "./Recommendations";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { AlertTriangle } from "lucide-react";
import { PdfExportButton } from "./PdfExportButton";
import { ShareButton } from "./ShareButton";

interface ResultReportProps {
  result: CalculationResult;
  toolSlug: string;
  toolName: string;
  inputs?: ToolInputs;
}

export function ResultReport({ result, toolSlug, toolName, inputs }: ResultReportProps) {
  return (
    <div className="space-y-6 animate-fade-in-up">
      {result.warnings.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:bg-amber-900/10 dark:border-amber-800">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-warning mt-0.5 shrink-0" />
            <div>
              <h4 className="font-semibold text-sm text-amber-800 dark:text-amber-300">
                Warnings
              </h4>
              <ul className="mt-1 space-y-1">
                {result.warnings.map((w, i) => (
                  <li
                    key={i}
                    className="text-sm text-amber-700 dark:text-amber-400"
                  >
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <p className="text-lg font-medium text-zinc-700 dark:text-zinc-300">
        {result.summary}
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {result.metrics.map((metric, i) => (
          <MetricCard key={i} metric={metric} index={i} />
        ))}
      </div>

      {result.sections.map((section, i) => (
        <div key={i} className="animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
          <Card>
            <CardHeader>
              <CardTitle>{section.title}</CardTitle>
            </CardHeader>
            <CardContent>
              {section.type === "table" && section.headers && section.rows && (
                <ResultTable headers={section.headers} rows={section.rows} />
              )}
              {section.type === "chart" && section.chartType === "bar" && section.chartData && (
                <BarChart data={section.chartData} />
              )}
              {section.type === "chart" && section.chartType === "donut" && section.chartData && (
                <DonutChart data={section.chartData} />
              )}
              {section.type === "text" && section.content && (
                <p className="text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-line">
                  {section.content}
                </p>
              )}
              {section.type === "comparison" && section.headers && section.rows && (
                <ResultTable headers={section.headers} rows={section.rows} />
              )}
            </CardContent>
          </Card>
        </div>
      ))}

      {result.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <Recommendations items={result.recommendations} />
          </CardContent>
        </Card>
      )}

      <div className="flex items-center gap-3 pt-2">
        <PdfExportButton result={result} toolName={toolName} />
        <ShareButton toolSlug={toolSlug} inputs={inputs} />
      </div>
    </div>
  );
}
