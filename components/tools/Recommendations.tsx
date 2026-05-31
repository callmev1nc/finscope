import type { Recommendation as RecType } from "@/lib/tools/types";
import { cn } from "@/lib/utils/cn";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";

interface RecommendationsProps {
  items: RecType[];
}

const priorityConfig = {
  high: {
    icon: AlertTriangle,
    color: "border-l-danger bg-red-50 dark:bg-red-900/10",
    textColor: "text-danger",
  },
  medium: {
    icon: AlertCircle,
    color: "border-l-warning bg-amber-50 dark:bg-amber-900/10",
    textColor: "text-warning",
  },
  low: {
    icon: Info,
    color: "border-l-primary bg-blue-50 dark:bg-blue-900/10",
    textColor: "text-primary",
  },
};

export function Recommendations({ items }: RecommendationsProps) {
  return (
    <div className="space-y-3">
      {items.map((rec, i) => {
        const config = priorityConfig[rec.priority];
        const Icon = config.icon;
        return (
          <div
            key={i}
            className={cn(
              "animate-fade-in-up rounded-lg border-l-4 border-border bg-card p-4 shadow-sm",
              config.color
            )}
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex items-start gap-3">
              <Icon className={cn("h-5 w-5 mt-0.5 shrink-0", config.textColor)} />
              <div>
                <h4 className="font-semibold text-sm">{rec.title}</h4>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  {rec.description}
                </p>
                {rec.impact && (
                  <p className="mt-1.5 text-xs font-medium text-success">
                    Impact: {rec.impact}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
