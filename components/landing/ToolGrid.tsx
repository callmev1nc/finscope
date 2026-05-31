"use client";

import { ToolCard } from "./ToolCard";
import type { ToolMeta } from "@/lib/tools/types";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils/cn";

interface ToolGridProps {
  tools: ToolMeta[];
}

const categories = [
  { id: "all", label: "All Tools" },
  { id: "budgeting", label: "Budgeting" },
  { id: "investing", label: "Investing" },
  { id: "debt", label: "Debt" },
  { id: "income", label: "Income" },
  { id: "planning", label: "Planning" },
  { id: "taxes", label: "Taxes" },
];

export function ToolGrid({ tools }: ToolGridProps) {
  const [activeCategory, setActiveCategory] = useState("all");

  const filtered = useMemo(
    () =>
      activeCategory === "all"
        ? tools
        : tools.filter((t) => t.category === activeCategory),
    [tools, activeCategory]
  );

  return (
    <section id="tools" className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight">All Financial Tools</h2>
          <p className="mt-3 text-zinc-500 dark:text-zinc-400 max-w-lg mx-auto">
            Choose from 15 powerful tools to optimize every aspect of your finances.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                activeCategory === cat.id
                  ? "bg-primary text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((tool) => (
            <div key={tool.slug} className="animate-fade-in-up">
              <ToolCard tool={tool} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
