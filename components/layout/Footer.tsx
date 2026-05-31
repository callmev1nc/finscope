import { APP_NAME } from "@/lib/utils/constants";

export function Footer() {
  return (
    <footer className="border-t border-border bg-white dark:bg-zinc-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-zinc-500">
            © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-sm text-zinc-500">Built with Next.js</span>
            <span className="text-sm text-zinc-400">·</span>
            <span className="text-sm text-zinc-500">Inspired by @TechByArti</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
