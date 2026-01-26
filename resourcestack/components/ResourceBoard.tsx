"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Plus, Search, Tag, Star, ExternalLink, RefreshCw } from "lucide-react";
import Link from "next/link";

type Resource = {
  id: string;
  urlOriginal: string;
  urlNormalized: string;
  title: string;
  notes?: string | null;
  isFavorite: boolean;
  tags: string[];
  updatedAt: string;
};

export function ResourceBoard() {
  const [items, setItems] = useState<Resource[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [tag, setTag] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ url: "", title: "", notes: "" });
  const [error, setError] = useState<string | null>(null);

  async function load(overrideTag?: string, overrideSearch?: string) {
    setLoading(true);
    setError(null);
    try {
      const qTag = overrideTag !== undefined ? overrideTag : tag;
      const qSearch = overrideSearch !== undefined ? overrideSearch : search;
      const data = await apiFetch<{ resources: Resource[] }>(`/api/resources?search=${encodeURIComponent(qSearch)}&tag=${encodeURIComponent(qTag)}`);
      setItems(data.resources);
      const t = await apiFetch<{ tags: string[] }>(`/api/tags`);
      setTags(t.tags);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const filtered = useMemo(() => items, [items]);

  async function createResource(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await apiFetch(`/api/resources`, {
        method: "POST",
        body: JSON.stringify({ url: form.url, title: form.title, notes: form.notes }),
      });
      setForm({ url: "", title: "", notes: "" });
      await load();
    } catch (e: any) {
      setError(e?.message ?? "Create failed");
    }
  }

  async function toggleFavorite(id: string, isFavorite: boolean) {
    setError(null);
    const prev = items;
    setItems((cur) => cur.map((r) => (r.id === id ? { ...r, isFavorite: !isFavorite } : r)));
    try {
      await apiFetch(`/api/resources/${id}`, { method: "PATCH", body: JSON.stringify({ isFavorite: !isFavorite }) });
    } catch (e: any) {
      setItems(prev);
      setError(e?.message ?? "Update failed");
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
      <section className="rounded-3xl bg-zinc-100/80 p-5 shadow-soft ring-1 ring-black/10 dark:bg-zinc-900/60 dark:ring-white/10">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Add a resource</h2>
          <div className="text-xs text-zinc-600 dark:text-zinc-300">Links, docs, tools</div>
        </div>

        <form onSubmit={createResource} className="mt-4 space-y-3">
          <div>
            <label className="text-xs text-zinc-600 dark:text-zinc-300">URL</label>
            <input
              value={form.url}
              onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
              placeholder="https://example.com/article"
              className="mt-1 w-full rounded-2xl bg-zinc-100 px-3 py-2 text-sm ring-1 ring-black/10 outline-none focus:ring-2 focus:ring-black/10 dark:bg-zinc-950/60 dark:ring-white/10 dark:focus:ring-white/20"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-600 dark:text-zinc-300">Title</label>
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Short, clear title"
              className="mt-1 w-full rounded-2xl bg-zinc-100 px-3 py-2 text-sm ring-1 ring-black/10 outline-none focus:ring-2 focus:ring-black/10 dark:bg-zinc-950/60 dark:ring-white/10 dark:focus:ring-white/20"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-600 dark:text-zinc-300">Notes (optional)</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="Why you saved it"
              rows={3}
              className="mt-1 w-full resize-none rounded-2xl bg-zinc-100 px-3 py-2 text-sm ring-1 ring-black/10 outline-none focus:ring-2 focus:ring-black/10 dark:bg-zinc-950/60 dark:ring-white/10 dark:focus:ring-white/20"
            />
          </div>
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-950 px-3 py-2 text-sm font-semibold text-white hover:bg-zinc-900 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100"
          >
            <Plus className="h-4 w-4" /> Save resource
          </button>
          {error ? <div className="rounded-2xl bg-rose-500/10 p-3 text-sm text-rose-200 ring-1 ring-rose-400/20">{error}</div> : null}
          <div className="rounded-2xl bg-zinc-200/60 p-3 text-xs text-zinc-600 ring-1 ring-black/10 dark:bg-zinc-950/40 dark:text-zinc-300 dark:ring-white/10">
            Tip: Use the star to pin favorites at the top.
          </div>
        </form>
      </section>

      <section className="rounded-3xl bg-zinc-100/70 p-5 shadow-soft ring-1 ring-black/10 dark:bg-zinc-900/40 dark:ring-white/10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold">Your library</h2>
            <div className="text-xs text-zinc-600 dark:text-zinc-300">{filtered.length} items</div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search title, URL, notes"
                className="w-full rounded-2xl bg-zinc-100 py-2 pl-9 pr-3 text-sm ring-1 ring-black/10 outline-none focus:ring-2 focus:ring-black/10 dark:bg-zinc-950/60 dark:ring-white/10 dark:focus:ring-white/20 sm:w-64"
              />
            </div>

            <div className="relative">
              <Tag className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
              <select
                value={tag}
                onChange={(e) => {
                  const v = e.target.value;
                  setTag(v);
                  void load(v);
                }}
                className="w-full appearance-none rounded-2xl bg-zinc-100 py-2 pl-9 pr-8 text-sm ring-1 ring-black/10 outline-none focus:ring-2 focus:ring-black/10 dark:bg-zinc-950/60 dark:ring-white/10 dark:focus:ring-white/20 sm:w-48"
              >
                <option value="">All tags</option>
                {tags.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 top-2.5 text-zinc-400">▾</div>
            </div>

            <button
              onClick={() => load()}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-zinc-100 px-3 py-2 text-sm ring-1 ring-black/10 hover:bg-zinc-200 dark:bg-zinc-950/60 dark:ring-white/10 dark:hover:bg-zinc-950/80"
              title="Refresh"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-3">
          {loading && items.length === 0 ? (
            <div className="rounded-3xl bg-zinc-100/70 p-10 text-center text-sm text-zinc-600 ring-1 ring-black/10 dark:bg-zinc-950/30 dark:text-zinc-300 dark:ring-white/10">
              Loading resources...
            </div>
          ) : (
            filtered.map((r) => (
              <div
                key={r.id}
                className="group card-clickable rounded-3xl bg-zinc-100/80 p-4 ring-1 ring-black/10 hover:bg-zinc-100 dark:bg-zinc-950/40 dark:ring-white/10 dark:hover:bg-zinc-950/50"
              >
                <div className="flex items-start justify-between gap-3">
                  <Link href={`/resources/${r.id}`} className="min-w-0 no-underline">
                    <div>
                      <div className="truncate text-sm font-semibold group-hover:underline">{r.title}</div>
                      <a
                        href={r.urlOriginal}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 inline-flex max-w-full items-center gap-2 truncate text-xs text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span className="truncate">{r.urlOriginal}</span>
                      </a>
                      {r.notes ? <div className="mt-2 text-sm text-zinc-800 dark:text-zinc-200/90">{r.notes}</div> : null}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {r.tags.map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              const next = tag === t ? "" : t;
                              setTag(next);
                              void load(next);
                            }}
                            className={
                              tag === t
                                ? "cursor-pointer rounded-full bg-zinc-950 px-2 py-1 text-xs font-semibold text-white ring-1 ring-black/10 dark:bg-white dark:text-zinc-950"
                                : "cursor-pointer rounded-full bg-zinc-100 px-2 py-1 text-xs text-zinc-700 ring-1 ring-black/10 hover:bg-zinc-200 dark:bg-white/10 dark:text-zinc-200 dark:ring-white/10 dark:hover:bg-white/15"
                            }
                            aria-label={`Filter by ${t}`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>

                      <div className="mt-3 flex items-center justify-start">
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">View details →</span>
                      </div>
                    </div>
                  </Link>

                  <button
                    onClick={() => toggleFavorite(r.id, r.isFavorite)}
                    className="grid h-10 w-10 place-items-center rounded-2xl bg-zinc-200/50 ring-1 ring-black/10 hover:bg-zinc-200/80 dark:bg-white/5 dark:ring-white/10 dark:hover:bg-white/10"
                    title={r.isFavorite ? "Unfavorite" : "Favorite"}
                  >
                    <Star className={`h-4 w-4 ${r.isFavorite ? "fill-yellow-300 text-yellow-300" : "text-zinc-700 dark:text-zinc-200"}`} />
                  </button>
                </div>
              </div>
            ))
          )}

          {filtered.length === 0 ? (
            <div className="rounded-3xl bg-zinc-100/70 p-10 text-center text-sm text-zinc-600 ring-1 ring-black/10 dark:bg-zinc-950/30 dark:text-zinc-300 dark:ring-white/10">
              No resources yet. Add your first link on the left.
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
