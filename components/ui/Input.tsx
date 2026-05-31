import { forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  prefix?: string;
  suffix?: string;
  tooltip?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, prefix, suffix, tooltip, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <div className="flex items-center gap-1.5">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {label}
            </label>
            {tooltip && (
              <span className="group relative cursor-help">
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-zinc-200 text-[10px] text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400">
                  ?
                </span>
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden w-48 rounded-lg bg-zinc-800 px-2 py-1 text-xs text-white group-hover:block dark:bg-zinc-700">
                  {tooltip}
                </span>
              </span>
            )}
          </div>
        )}
        <div className="relative">
          {prefix && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-500">
              {prefix}
            </span>
          )}
          <input
            ref={ref}
            className={cn(
              "flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100",
              prefix && "pl-8",
              suffix && "pr-12",
              error && "border-danger focus:ring-danger/50 focus:border-danger",
              className
            )}
            {...props}
          />
          {suffix && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-zinc-500">
              {suffix}
            </span>
          )}
        </div>
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
