"use client";

import { APP_NAME, APP_TAGLINE } from "@/lib/utils/constants";
import { Button } from "@/components/ui/Button";
import { Menu, X, Sparkles, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // Read theme preference from external storage on mount (valid one-time init)
  useEffect(() => {
    const stored = localStorage.getItem("finscope-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const dark = stored === "dark" || (!stored && prefersDark);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading external storage on mount
    setIsDark(dark);
    document.documentElement.classList.toggle("dark", dark);
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("finscope-theme", next ? "dark" : "light");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-white/80 backdrop-blur-md dark:bg-zinc-900/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary text-white text-sm font-bold">
            F
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight">{APP_NAME}</span>
            <span className="ml-2 text-xs text-zinc-500 hidden sm:inline">
              {APP_TAGLINE}
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-medium text-zinc-600 hover:text-primary transition-colors dark:text-zinc-400"
          >
            Tools
          </Link>
          <Link
            href="/pricing"
            className="text-sm font-medium text-zinc-600 hover:text-primary transition-colors dark:text-zinc-400"
          >
            Pricing
          </Link>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-zinc-600 hover:bg-zinc-100 transition-colors dark:text-zinc-400 dark:hover:bg-zinc-800"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <Button size="sm" variant="primary" leftIcon={<Sparkles className="h-3.5 w-3.5" />}>
            Get Started
          </Button>
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-zinc-600 hover:bg-zinc-100 transition-colors dark:text-zinc-400 dark:hover:bg-zinc-800"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <button
            className="p-2 text-zinc-600"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden border-t border-border bg-white dark:bg-zinc-900 px-4 py-4 space-y-3 animate-fade-in-up">
          <Link
            href="/"
            className="block text-sm font-medium text-zinc-600 dark:text-zinc-400"
            onClick={() => setIsOpen(false)}
          >
            Tools
          </Link>
          <Link
            href="/pricing"
            className="block text-sm font-medium text-zinc-600 dark:text-zinc-400"
            onClick={() => setIsOpen(false)}
          >
            Pricing
          </Link>
          <Button size="sm" variant="primary" className="w-full">
            <Sparkles className="h-3.5 w-3.5" />
            Get Started
          </Button>
        </div>
      )}
    </header>
  );
}
