import type { ToolMeta } from "@/lib/tools/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ArrowRight, LucideIcon, icons } from "lucide-react";
import Link from "next/link";

interface ToolCardProps {
  tool: ToolMeta;
}

function DynamicIcon({ name, className }: { name: string; className?: string }) {
  const iconName = name as keyof typeof icons;
  const LucideIcon = icons[iconName] as LucideIcon | undefined;
  if (!LucideIcon) return null;
  return <LucideIcon className={className} />;
}

const categoryLabels: Record<string, string> = {
  budgeting: "Budgeting",
  investing: "Investing",
  debt: "Debt",
  income: "Income",
  planning: "Planning",
  taxes: "Taxes",
};

const categoryColors: Record<string, string> = {
  budgeting: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20",
  investing: "text-blue-600 bg-blue-50 dark:bg-blue-900/20",
  debt: "text-red-600 bg-red-50 dark:bg-red-900/20",
  income: "text-purple-600 bg-purple-50 dark:bg-purple-900/20",
  planning: "text-amber-600 bg-amber-50 dark:bg-amber-900/20",
  taxes: "text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20",
};

export function ToolCard({ tool }: ToolCardProps) {
  return (
    <Link href={tool.isPremium ? "/pricing" : `/tools/${tool.slug}`}>
      <Card hover className="group h-full cursor-pointer">
        <div className="flex flex-col h-full">
          <div className="flex items-start justify-between mb-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                categoryColors[tool.category] || "bg-zinc-100 text-zinc-600"
              }`}
            >
              <DynamicIcon name={tool.icon} className="h-5 w-5" />
            </div>
            <Badge
              variant={tool.isPremium ? "premium" : "default"}
            >
              {tool.isPremium ? "Premium" : "Free"}
            </Badge>
          </div>
          <h3 className="font-semibold text-base mb-1 group-hover:text-primary transition-colors">
            {tool.name}
          </h3>
          <p className="text-sm text-zinc-500 flex-1 line-clamp-2">
            {tool.description}
          </p>
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
            <span className="text-xs text-zinc-400">
              {categoryLabels[tool.category]}
            </span>
            <span className="flex items-center gap-1 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
              {tool.isPremium ? "Unlock" : "Use Tool"}
              <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
