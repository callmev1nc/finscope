"use client";

import { Button } from "@/components/ui/Button";
import { AlertTriangle } from "lucide-react";

export default function ToolError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 mx-auto mb-6">
        <AlertTriangle className="h-8 w-8 text-danger" />
      </div>
      <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
      <p className="text-zinc-500 dark:text-zinc-400 max-w-md mx-auto mb-6">
        {error.message || "An unexpected error occurred while loading this tool."}
      </p>
      <Button variant="primary" onClick={reset}>
        Try Again
      </Button>
    </div>
  );
}
