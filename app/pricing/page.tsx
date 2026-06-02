import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Check, Heart } from "lucide-react";
import Link from "next/link";
import { getAllTools } from "@/lib/tools/registry";

export default function PricingPage() {
  const toolCount = getAllTools().length;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20">
      <div className="text-center mb-12">
        <Badge variant="default" className="mb-4">
          <Heart className="h-3 w-3 mr-1" />
          100% Free
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight">All Tools, No Cost</h1>
        <p className="mt-4 text-lg text-zinc-500 dark:text-zinc-400 max-w-lg mx-auto">
          Every financial planning tool is completely free. No hidden fees, no premium tiers, no sign-up required.
        </p>
      </div>

      <div className="max-w-lg mx-auto">
        <Card className="relative overflow-hidden">
          <div className="text-center">
            <h3 className="text-xl font-bold">Free Forever</h3>
            <p className="mt-1 text-zinc-500 dark:text-zinc-400">All features, zero cost</p>
            <p className="mt-4">
              <span className="text-4xl font-bold">$0</span>
              <span className="text-zinc-400">/forever</span>
            </p>
            <div className="mt-6 space-y-3 text-left">
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-success mt-0.5 shrink-0" />
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  All {toolCount} financial planning tools
                </span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-success mt-0.5 shrink-0" />
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  Advanced calculations and detailed reports
                </span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-success mt-0.5 shrink-0" />
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  PDF export for all tools
                </span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-success mt-0.5 shrink-0" />
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  Share results with friends
                </span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-success mt-0.5 shrink-0" />
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  No account needed — start instantly
                </span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-success mt-0.5 shrink-0" />
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  No ads, no limits, no catch
                </span>
              </div>
            </div>
            <Link href="/" className="mt-6 block">
              <Button variant="primary" size="lg" className="w-full bg-gradient-to-r from-primary to-secondary">
                Explore All Tools
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
