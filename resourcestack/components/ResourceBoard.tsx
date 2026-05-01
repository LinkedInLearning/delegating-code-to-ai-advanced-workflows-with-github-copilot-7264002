"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Plus, Tag, Star, ExternalLink, RefreshCw, Bookmark } from "lucide-react";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const [items, setItems] = useState<Resource[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tag, setTag] = useState("");
  const [search, setSearch] = useState("");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ url: "", title: "", notes: "", tags: "" });
  const [error, setError] = useState<string | null>(null);
  const [fetchingMetadata, setFetchingMetadata] = useState(false);
  const [metadataFailed, setMetadataFailed] = useState(false);

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

  // Auto-fetch metadata when URL changes
  useEffect(() => {
    if (!form.url.match(/^https?:\/\/.+/)) {
      setMetadataFailed(false);
      return;
    }
    
    setMetadataFailed(false);
    const timeoutId = setTimeout(() => {
      void fetchMetadata(form.url);
    }, 800);
    
    return () => clearTimeout(timeoutId);
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [form.url]);

  const filtered = useMemo(() => {
    if (showFavoritesOnly) {
      return items.filter((r) => r.isFavorite);
    }
    return items;
  }, [items, showFavoritesOnly]);

  async function createResource(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const response = await apiFetch<{ resource: Resource }>(`/api/resources`, {
        method: "POST",
        body: JSON.stringify({ url: form.url, title: form.title, notes: form.notes }),
      });
      
      // Add tags if provided
      if (form.tags.trim()) {
        const tagNames = form.tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
        for (const tagName of tagNames) {
          try {
            // Create tag if it doesn't exist
            await apiFetch(`/api/tags`, { method: "POST", body: JSON.stringify({ name: tagName }) });
            // Attach to resource
            await apiFetch(`/api/resources/${response.resource.id}/tags`, { 
              method: "POST", 
              body: JSON.stringify({ name: tagName }) 
            });
          } catch (tagError) {
            console.error(`Failed to add tag ${tagName}:`, tagError);
          }
        }
      }
      
      setForm({ url: "", title: "", notes: "", tags: "" });
      setTag("");
      setShowFavoritesOnly(false);
      await load("");
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

  async function fetchMetadata(url: string) {
    if (!url || !url.startsWith("http")) return;
    
    setFetchingMetadata(true);
    setError(null);
    
    try {
      // Try server-side fetch first
      const data = await apiFetch<{ title: string; description: string }>(`/api/metadata`, {
        method: "POST",
        body: JSON.stringify({ url }),
      });
      
      // Check if we got meaningful data (not just hostname fallback)
      const hasMetadata = data.title && data.title !== new URL(url).hostname;
      
      // Only update if fields are empty
      setForm((prev) => ({
        ...prev,
        title: prev.title || data.title,
        notes: prev.notes || data.description,
      }));
      
      // If server-side failed, try client-side as fallback
      if (!hasMetadata) {
        const clientSuccess = await fetchMetadataClientSide(url);
        setMetadataFailed(!clientSuccess);
      } else {
        setMetadataFailed(false);
      }
    } catch (e: any) {
      // Try client-side as fallback
      console.error("Server-side metadata fetch failed:", e);
      const clientSuccess = await fetchMetadataClientSide(url);
      setMetadataFailed(!clientSuccess);
    } finally {
      setFetchingMetadata(false);
    }
  }

  async function fetchMetadataClientSide(url: string): Promise<boolean> {
    try {
      // Try to fetch directly from client (may be blocked by CORS)
      const response = await fetch(url, { 
        mode: 'cors',
        credentials: 'omit',
      });
      
      if (!response.ok) return false;
      
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Extract metadata using DOM
      const title = 
        doc.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
        doc.querySelector('meta[name="twitter:title"]')?.getAttribute('content') ||
        doc.querySelector('title')?.textContent ||
        '';
      
      const description = 
        doc.querySelector('meta[property="og:description"]')?.getAttribute('content') ||
        doc.querySelector('meta[name="twitter:description"]')?.getAttribute('content') ||
        doc.querySelector('meta[name="description"]')?.getAttribute('content') ||
        '';
      
      // Only update if we got data and fields are still empty
      if (title) {
        setForm((prev) => ({
          ...prev,
          title: prev.title || title.trim(),
          notes: prev.notes || description.trim(),
        }));
        return true;
      }
      return false;
    } catch (e) {
      // CORS or other error - silently fail, user can enter manually
      console.log("Client-side fetch blocked (CORS):", e);
      return false;
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[440px_1fr]">
      {/* Add Resource Form */}
      <section className="glass animate-fade-in sticky top-6 self-start max-h-[calc(100vh-3rem)] overflow-y-auto rounded-3xl bg-white/60 p-6 shadow-soft ring-1 ring-zinc-200/50 backdrop-blur-sm dark:bg-zinc-900/50 dark:ring-zinc-700/50">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Add a resource</h2>
          <div className="rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-semibold text-blue-600 ring-1 ring-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400">
            Quick add
          </div>
        </div>

        <form onSubmit={createResource} className="mt-5 space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">URL</label>
              {fetchingMetadata && (
                <span className="flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400">
                  <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-blue-600 border-t-transparent dark:border-blue-400"></span>
                  Fetching info...
                </span>
              )}
            </div>
            <input
              value={form.url}
              onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
              placeholder="https://example.com/article"
              className="input-focus mt-1.5 w-full rounded-2xl bg-zinc-50 px-4 py-2.5 text-sm ring-1 ring-zinc-200 transition-all placeholder:text-zinc-400 focus:bg-white focus:ring-2 focus:ring-blue-500/40 dark:bg-zinc-900/60 dark:ring-zinc-700 dark:placeholder:text-zinc-500 dark:focus:bg-zinc-900 dark:focus:ring-blue-500/40"
            />
            {metadataFailed && (
              <div className="mt-2 animate-fade-in rounded-xl bg-amber-50 p-2.5 text-xs text-amber-800 ring-1 ring-amber-200/50 dark:bg-amber-950/30 dark:text-amber-200 dark:ring-amber-900/30">
                ⚠️ Couldn't auto-fetch metadata (site may block automated requests). Please enter title manually.
              </div>
            )}
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Title</label>
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Auto-filled or enter manually"
              className="input-focus mt-1.5 w-full rounded-2xl bg-zinc-50 px-4 py-2.5 text-sm ring-1 ring-zinc-200 transition-all placeholder:text-zinc-400 focus:bg-white focus:ring-2 focus:ring-blue-500/40 dark:bg-zinc-900/60 dark:ring-zinc-700 dark:placeholder:text-zinc-500 dark:focus:bg-zinc-900 dark:focus:ring-blue-500/40"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Notes (optional)</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="Auto-filled from page description or add your own"
              rows={3}
              className="input-focus mt-1.5 w-full resize-none rounded-2xl bg-zinc-50 px-4 py-2.5 text-sm ring-1 ring-zinc-200 transition-all placeholder:text-zinc-400 focus:bg-white focus:ring-2 focus:ring-blue-500/40 dark:bg-zinc-900/60 dark:ring-zinc-700 dark:placeholder:text-zinc-500 dark:focus:bg-zinc-900 dark:focus:ring-blue-500/40"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Tags (optional)</label>
            <input
              value={form.tags}
              onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
              placeholder="javascript, frontend, tools (comma-separated)"
              className="input-focus mt-1.5 w-full rounded-2xl bg-zinc-50 px-4 py-2.5 text-sm ring-1 ring-zinc-200 transition-all placeholder:text-zinc-400 focus:bg-white focus:ring-2 focus:ring-blue-500/40 dark:bg-zinc-900/60 dark:ring-zinc-700 dark:placeholder:text-zinc-500 dark:focus:bg-zinc-900 dark:focus:ring-blue-500/40"
              list="existing-tags"
            />
            <datalist id="existing-tags">
              {tags.map((t) => (
                <option key={t} value={t} />
              ))}
            </datalist>
            <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
              Separate multiple tags with commas. Tags are saved in lowercase.
            </div>
          </div>
          <button
            type="submit"
            className="btn-press inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-3 text-sm font-bold text-white shadow-lg transition-all hover:from-blue-700 hover:to-violet-700 hover:shadow-xl"
          >
            <Plus className="h-4 w-4" /> Save resource
          </button>
          {error ? (
            <div className="animate-fade-in rounded-2xl bg-rose-500/10 p-3 text-sm font-medium text-rose-600 ring-1 ring-rose-500/20 dark:text-rose-400">
              {error}
            </div>
          ) : null}
          <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-violet-50 p-3.5 text-xs text-zinc-700 ring-1 ring-blue-100/50 dark:from-blue-950/30 dark:to-violet-950/30 dark:text-zinc-300 dark:ring-blue-900/30">
            <span className="font-semibold">✨ Quick add:</span> Paste a URL and we'll auto-fill title & description. Add tags to organize and filter your resources!
          </div>
        </form>
      </section>

      {/* Resource Library */}
      <section className="glass animate-fade-in rounded-3xl bg-white/50 p-6 shadow-soft ring-1 ring-zinc-200/50 backdrop-blur-sm dark:bg-zinc-900/40 dark:ring-zinc-700/50">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Your library</h2>
        
        {/* Tabs */}
        <div className="mt-4 flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-700">
          <button
            onClick={() => setShowFavoritesOnly(false)}
            className={`btn-press relative inline-flex items-center gap-2 px-4 pb-3 pt-2 text-sm font-semibold transition-all ${
              !showFavoritesOnly
                ? "text-blue-600 dark:text-blue-400"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            <Bookmark className="h-4 w-4" />
            All Resources
            <span className="ml-1 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-bold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              {items.length}
            </span>
            {!showFavoritesOnly && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-violet-600"></div>
            )}
          </button>
          
          <button
            onClick={() => setShowFavoritesOnly(true)}
            className={`btn-press relative inline-flex items-center gap-2 px-4 pb-3 pt-2 text-sm font-semibold transition-all ${
              showFavoritesOnly
                ? "text-yellow-600 dark:text-yellow-400"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            <Star className={`h-4 w-4 ${showFavoritesOnly ? "fill-current" : ""}`} />
            Favorites
            <span className="ml-1 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-bold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              {items.filter((r) => r.isFavorite).length}
            </span>
            {showFavoritesOnly && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-yellow-500 to-orange-500"></div>
            )}
          </button>
        </div>

        {/* Filters */}
        <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            {filtered.length} {filtered.length === 1 ? "item" : "items"}
            {showFavoritesOnly ? " starred" : ""}
          </div>
          
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
            <div className="relative">
              <input
                type="search"
                value={search}
                onChange={(e) => {
                  const v = e.target.value;
                  setSearch(v);
                  void load(undefined, v);
                }}
                placeholder="Search by title..."
                className="input-focus w-full rounded-2xl bg-zinc-50 px-4 py-2.5 text-sm ring-1 ring-zinc-200 transition-all placeholder:text-zinc-400 focus:bg-white focus:ring-2 focus:ring-blue-500/40 dark:bg-zinc-900/60 dark:ring-zinc-700 dark:placeholder:text-zinc-500 dark:focus:bg-zinc-900 dark:focus:ring-blue-500/40 sm:w-56"
              />
            </div>
            <div className="relative">
              <Tag className="pointer-events-none absolute left-3.5 top-2.5 h-4 w-4 text-zinc-400 dark:text-zinc-500" />
              <select
                value={tag}
                onChange={(e) => {
                  const v = e.target.value;
                  setTag(v);
                  void load(v);
                }}
                className="input-focus w-full appearance-none rounded-2xl bg-zinc-50 py-2.5 pl-10 pr-10 text-sm ring-1 ring-zinc-200 transition-all focus:bg-white focus:ring-2 focus:ring-blue-500/40 dark:bg-zinc-900/60 dark:ring-zinc-700 dark:focus:bg-zinc-900 dark:focus:ring-blue-500/40 sm:w-48"
              >
                <option value="">All tags</option>
                {tags.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3.5 top-3 text-sm text-zinc-400">▾</div>
            </div>

            <button
              onClick={() => load()}
              className="btn-press inline-flex items-center justify-center gap-2 rounded-2xl bg-zinc-100 px-4 py-2.5 text-sm font-semibold ring-1 ring-zinc-200 transition-all hover:bg-zinc-200 dark:bg-zinc-800/60 dark:ring-zinc-700 dark:hover:bg-zinc-800"
              title="Refresh"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Active Filter Badge */}
        {tag && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Active filter:</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-600 to-violet-600 px-3 py-1 text-xs font-bold text-white shadow-md">
              <Tag className="h-3 w-3" />
              {tag}
              <button
                type="button"
                aria-label="Clear filter"
                onClick={() => { setTag(""); void load(""); }}
                className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-white/20 transition-colors hover:bg-white/40"
              >
                ×
              </button>
            </span>
          </div>
        )}

        <div className="mt-6 grid gap-3.5">
          {loading && items.length === 0 ? (
            <div className="animate-fade-in rounded-3xl bg-zinc-50/70 p-12 text-center ring-1 ring-zinc-200/50 dark:bg-zinc-900/30 dark:ring-zinc-700/50">
              <div className="shimmer mb-3 inline-block h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-blue-500"></div>
              <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Loading resources...</div>
            </div>
          ) : (
            filtered.map((r, idx) => (
              <div
                key={r.id}
                className="card-clickable group animate-fade-in rounded-3xl bg-white/80 p-5 ring-1 ring-zinc-200/80 transition-all hover:bg-white hover:shadow-soft dark:bg-zinc-900/50 dark:ring-zinc-700/50 dark:hover:bg-zinc-900/70"
                style={{ animationDelay: `${idx * 30}ms` }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div
                    role="link"
                    tabIndex={0}
                    onClick={() => router.push(`/resources/${r.id}`)}
                    onKeyDown={(e) => e.key === "Enter" && router.push(`/resources/${r.id}`)}
                    className="min-w-0 flex-1 cursor-pointer no-underline outline-none"
                  >
                    <div>
                      <div className="truncate text-base font-bold text-zinc-900 transition-colors group-hover:text-blue-600 dark:text-zinc-50 dark:group-hover:text-blue-400">
                        {r.title}
                      </div>
                      <a
                        href={r.urlOriginal}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1.5 inline-flex max-w-full items-center gap-2 truncate text-xs font-medium text-zinc-500 transition-colors hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="truncate">{r.urlOriginal}</span>
                      </a>
                      {r.notes ? (
                        <div className="mt-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                          {r.notes}
                        </div>
                      ) : null}
                      <div className="mt-4 flex flex-wrap gap-2">
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
                                ? "btn-press cursor-pointer rounded-full bg-gradient-to-r from-blue-600 to-violet-600 px-3 py-1.5 text-xs font-bold text-white shadow-md transition-all hover:shadow-lg"
                                : "btn-press cursor-pointer rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-700 ring-1 ring-zinc-200 transition-all hover:bg-zinc-200 hover:ring-zinc-300 dark:bg-zinc-800/60 dark:text-zinc-300 dark:ring-zinc-700 dark:hover:bg-zinc-800 dark:hover:ring-zinc-600"
                            }
                            aria-label={`Filter by ${t}`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>

                      <div className="mt-4 flex items-center justify-start gap-1.5 text-xs font-medium text-zinc-500 opacity-0 transition-opacity group-hover:opacity-100 dark:text-zinc-400">
                        <span>View details</span>
                        <span className="transition-transform group-hover:translate-x-0.5">→</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleFavorite(r.id, r.isFavorite)}
                    className="btn-press grid h-11 w-11 flex-shrink-0 place-items-center rounded-2xl bg-zinc-100/80 ring-1 ring-zinc-200 transition-all hover:bg-zinc-200 hover:ring-zinc-300 dark:bg-zinc-800/60 dark:ring-zinc-700 dark:hover:bg-zinc-800 dark:hover:ring-zinc-600"
                    title={r.isFavorite ? "Unfavorite" : "Favorite"}
                  >
                    <Star
                      className={`h-5 w-5 transition-all ${
                        r.isFavorite
                          ? "fill-yellow-400 text-yellow-400 drop-shadow-sm"
                          : "text-zinc-400 hover:text-yellow-400 dark:text-zinc-500"
                      }`}
                    />
                  </button>
                </div>
              </div>
            ))
          )}

          {!loading && filtered.length === 0 && items.length === 0 ? (
            <div className="animate-fade-in rounded-3xl bg-gradient-to-br from-blue-50 to-violet-50 p-16 text-center ring-1 ring-blue-100/50 dark:from-blue-950/20 dark:to-violet-950/20 dark:ring-blue-900/30">
              <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-white shadow-soft ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-700">
                <Bookmark className="h-8 w-8 text-zinc-400" />
              </div>
              <div className="text-base font-bold text-zinc-900 dark:text-zinc-100">No resources yet</div>
              <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Add your first link using the form on the left to get started.
              </div>
            </div>
          ) : null}

          {!loading && filtered.length === 0 && items.length > 0 ? (
            <div className="animate-fade-in rounded-3xl bg-zinc-50/70 p-12 text-center ring-1 ring-zinc-200/50 dark:bg-zinc-900/30 dark:ring-zinc-700/50">
              <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                No resources match your current filters.
              </div>
              <button
                onClick={() => {
                  setTag("");
                  setShowFavoritesOnly(false);
                  void load("");
                }}
                className="btn-press mt-4 inline-flex items-center gap-2 rounded-2xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
              >
                Clear filters
              </button>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
