import Link from "next/link";
import { Bookmark, Sparkles } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-8">
      <header className="site-header animate-fade-in">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/resources" className="group no-underline">
            <div className="inline-flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-glow ring-1 ring-white/20 transition-all group-hover:scale-105 group-hover:shadow-xl">
                <Bookmark className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold tracking-tight">
                  <span className="gradient-text">ResourceStack</span>
                </div>
                <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  Save, tag, and find what matters.
                </div>
              </div>
            </div>
          </Link>
          <div className="flex flex-col gap-3 sm:items-end">
            <div className="inline-flex items-center gap-2 rounded-full bg-zinc-100/80 px-3 py-1.5 text-sm font-medium text-zinc-700 ring-1 ring-black/5 backdrop-blur-sm dark:bg-zinc-800/60 dark:text-zinc-300 dark:ring-white/10">
              <Sparkles className="h-4 w-4 text-blue-500 dark:text-blue-400" />
              <span>Fast, simple, and clean</span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>
      {children}
      <footer className="pt-12 text-xs text-zinc-500 dark:text-zinc-400">
        <div className="border-t border-zinc-300/50 pt-6 dark:border-zinc-700/50">
          <div className="flex items-center justify-center gap-2">
            <Bookmark className="h-3.5 w-3.5 text-zinc-400" />
            <span>Built for hands-on delegation labs using Copilot Agent Mode.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
