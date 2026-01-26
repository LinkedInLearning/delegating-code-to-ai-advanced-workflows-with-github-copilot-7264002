import Link from "next/link";
import { Bookmark, Sparkles } from "lucide-react";

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/resources" className="no-underline">
          <div className="inline-flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-zinc-900 shadow-soft ring-1 ring-white/10">
              <Bookmark className="h-5 w-5 text-zinc-50" />
            </div>
            <div>
              <div className="text-lg font-semibold tracking-tight">ResourceStack</div>
              <div className="text-sm text-zinc-300">Save, tag, and find what matters.</div>
            </div>
          </div>
        </Link>
        <div className="inline-flex items-center gap-2 text-sm text-zinc-300">
          <Sparkles className="h-4 w-4" />
          <span>Fast, simple, and clean</span>
        </div>
      </header>
      {children}
      <footer className="pt-8 text-xs text-zinc-400">
        <div className="border-t border-white/10 pt-6">
          Built for hands-on delegation labs using Copilot Agent Mode.
        </div>
      </footer>
    </div>
  );
}
