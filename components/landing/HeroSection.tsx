import { APP_DESCRIPTION } from "@/lib/utils/constants";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-28">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center relative">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-zinc-50 px-4 py-1.5 text-sm text-zinc-600 mb-8 dark:bg-zinc-800 dark:text-zinc-400">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span>16 Smart Financial Planning Tools — 100% Free</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl max-w-3xl mx-auto">
          Take Control of Your{" "}
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Financial Future
          </span>
        </h1>
        <p className="mt-6 text-lg text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto">
          {APP_DESCRIPTION}
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link href="#tools">
            <Button size="lg" variant="primary" rightIcon={<ArrowRight className="h-4 w-4" />}>
              Explore Tools
            </Button>
          </Link>
          <Link href="/pricing">
            <Button size="lg" variant="outline">
              Why Free?
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
