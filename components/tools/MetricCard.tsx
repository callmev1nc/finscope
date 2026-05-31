import type { Metric } from "@/lib/tools/types";
import { cn } from "@/lib/utils/cn";
import { TrendingUp, TrendingDown } from "lucide-react";

interface MetricCardProps {
  metric: Metric;
  index: number;
}

export function MetricCard({ metric, index }: MetricCardProps) {
  return (
    <div
      className="animate-scale-in rounded-xl border border-border bg-card p-5 shadow-sm"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <p className="text-sm text-zinc-500 mb-1">{metric.label}</p>
      <p className="text-2xl font-bold tracking-tight">{metric.value}</p>
      {metric.change && (
        <div
          className={cn(
            "mt-1 flex items-center gap-1 text-xs font-medium",
            metric.isPositive ? "text-success" : "text-danger"
          )}
        >
          {metric.isPositive ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          {metric.change}
        </div>
      )}
    </div>
  );
}
