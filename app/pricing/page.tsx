import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Check, Sparkles } from "lucide-react";
import Link from "next/link";
import { getFreeTools, getPremiumTools } from "@/lib/tools/registry";

export default function PricingPage() {
  const freeCount = getFreeTools().length;
  const premiumCount = getPremiumTools().length;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20">
      <div className="text-center mb-12">
        <Badge variant="premium" className="mb-4">
          <Sparkles className="h-3 w-3 mr-1" />
          Flexible Plans
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight">Simple, Transparent Pricing</h1>
        <p className="mt-4 text-lg text-zinc-500 dark:text-zinc-400 max-w-lg mx-auto">
          Start with free tools. Upgrade to premium for advanced financial planning.
        </p>
      </div>

      <div className="grid gap-8 max-w-3xl mx-auto lg:grid-cols-2">
        <Card className="relative">
          <div className="text-center">
            <h3 className="text-xl font-bold">Free</h3>
            <p className="mt-1 text-zinc-500 dark:text-zinc-400">Get started with basics</p>
            <p className="mt-4">
              <span className="text-4xl font-bold">$0</span>
              <span className="text-zinc-400">/forever</span>
            </p>
            <div className="mt-6 space-y-3 text-left">
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-success mt-0.5 shrink-0" />
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  {freeCount} free financial tools
                </span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-success mt-0.5 shrink-0" />
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  Basic calculations and reports
                </span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-success mt-0.5 shrink-0" />
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  PDF export
                </span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-success mt-0.5 shrink-0" />
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  Share results with friends
                </span>
              </div>
            </div>
            <Link href="/" className="mt-6 block">
              <Button variant="outline" size="lg" className="w-full">
                Get Started Free
              </Button>
            </Link>
          </div>
        </Card>

        <Card className="relative overflow-hidden border-primary/30">
          <div className="absolute top-0 right-0">
            <Badge variant="premium" className="rounded-none rounded-bl-lg rounded-tr-xl px-3 py-1">
              <Sparkles className="h-3 w-3 mr-1" />
              Popular
            </Badge>
          </div>
          <div className="text-center pt-4">
            <h3 className="text-xl font-bold">Premium</h3>
            <p className="mt-1 text-zinc-500 dark:text-zinc-400">Advanced financial planning</p>
            <p className="mt-4">
              <span className="text-4xl font-bold">$9</span>
              <span className="text-zinc-400">/month</span>
            </p>
            <div className="mt-6 space-y-3 text-left">
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-success mt-0.5 shrink-0" />
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  All {freeCount} free tools
                </span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-success mt-0.5 shrink-0" />
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  {premiumCount} premium tools unlocked
                </span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-success mt-0.5 shrink-0" />
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  Detailed analytics and charts
                </span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-success mt-0.5 shrink-0" />
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  Priority support
                </span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-success mt-0.5 shrink-0" />
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  No ads or limits
                </span>
              </div>
            </div>
            <Link href="/" className="mt-6 block">
              <Button variant="primary" size="lg" className="w-full bg-gradient-to-r from-primary to-secondary">
                <Sparkles className="h-4 w-4" />
                Get Started
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
