"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Save, Trash2, Tag, X } from "lucide-react";

type Resource = {
  id: string;
  urlOriginal: string;
  title: string;
  notes?: string | null;
  isFavorite: boolean;
  tags: string[];
};

export function ResourceDetail({ id }: { id: string }) {
  const [resource, setResource] = useState<Resource | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);
    try {
      const r = await apiFetch<{ resource: Resource }>(`/api/resources/${id}`);
      setResource(r.resource);
      const t = await apiFetch<{ tags: string[] }>(`/api/tags`);
      setTags(t.tags);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load");
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [id]);

  async function save() {
    if (!resource) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await apiFetch<{ resource: Resource }>(`/api/resources/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: resource.title,
          notes: resource.notes ?? "",
          urlOriginal: resource.urlOriginal,
          isFavorite: resource.isFavorite
        }),
      });
      setResource(updated.resource);
      // Redirect back to main page after successful save
      window.location.href = "/resources";
    } catch (e: any) {
      setError(e?.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!confirm("Delete this resource?")) return;
    setError(null);
    try {
      await apiFetch(`/api/resources/${id}`, { method: "DELETE" });
      window.location.href = "/resources";
    } catch (e: any) {
      setError(e?.message ?? "Delete failed");
    }
  }

  async function addTag() {
    if (!resource) return;
    const name = tagInput.trim();
    if (!name) return;

    setError(null);
    try {
      // create tag if missing
      await apiFetch(`/api/tags`, { method: "POST", body: JSON.stringify({ name }) });
      // attach to resource
      await apiFetch(`/api/resources/${id}/tags`, { method: "POST", body: JSON.stringify({ name }) });
      setTagInput("");
      await load();
    } catch (e: any) {
      setError(e?.message ?? "Tag failed");
    }
  }

  async function removeTag(name: string) {
    setError(null);
    try {
      await apiFetch(`/api/resources/${id}/tags`, { method: "DELETE", body: JSON.stringify({ name }) });
      await load();
    } catch (e: any) {
      setError(e?.message ?? "Remove tag failed");
    }
  }

  if (!resource) {
    return (
      <div className="glass animate-fade-in rounded-3xl bg-white/60 p-8 ring-1 ring-zinc-200/50 backdrop-blur-sm dark:bg-zinc-900/50 dark:ring-zinc-700/50">
        <div className="shimmer mb-3 inline-block h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-blue-500"></div>
        <div className="text-sm font-medium text-zinc-600 dark:text-zinc-300">Loading resource details...</div>
        {error ? (
          <div className="mt-4 animate-fade-in rounded-2xl bg-rose-500/10 p-3 text-sm font-medium text-rose-600 ring-1 ring-rose-500/20 dark:text-rose-400">
            {error}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center justify-between">
        <Link
          href="/resources"
          className="btn-press inline-flex items-center gap-2 rounded-2xl bg-zinc-100 px-4 py-2.5 text-sm font-semibold no-underline ring-1 ring-zinc-200 transition-all hover:bg-zinc-200 dark:bg-zinc-800/60 dark:ring-zinc-700 dark:hover:bg-zinc-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to library
        </Link>
        <a
          href={resource.urlOriginal}
          target="_blank"
          rel="noreferrer"
          className="btn-press inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2.5 text-sm font-bold text-white no-underline shadow-lg transition-all hover:from-blue-700 hover:to-violet-700 hover:shadow-xl"
        >
          <ExternalLink className="h-4 w-4" /> Open link
        </a>
      </div>

      <div className="glass rounded-3xl bg-white/60 p-6 shadow-soft ring-1 ring-zinc-200/50 backdrop-blur-sm dark:bg-zinc-900/50 dark:ring-zinc-700/50">
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-5">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Title</label>
              <input
                value={resource.title}
                onChange={(e) => setResource({ ...resource, title: e.target.value })}
                className="input-focus mt-1.5 w-full rounded-2xl bg-zinc-50 px-4 py-2.5 text-sm ring-1 ring-zinc-200 transition-all focus:bg-white focus:ring-2 focus:ring-blue-500/40 dark:bg-zinc-900/60 dark:ring-zinc-700 dark:focus:bg-zinc-900 dark:focus:ring-blue-500/40"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">URL</label>
              <input
                value={resource.urlOriginal}
                onChange={(e) => setResource({ ...resource, urlOriginal: e.target.value })}
                className="input-focus mt-1.5 w-full rounded-2xl bg-zinc-50 px-4 py-2.5 text-sm ring-1 ring-zinc-200 transition-all focus:bg-white focus:ring-2 focus:ring-blue-500/40 dark:bg-zinc-900/60 dark:ring-zinc-700 dark:focus:bg-zinc-900 dark:focus:ring-blue-500/40"
              />
              <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                💡 Duplicate detection uses a normalized version of this URL.
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Notes</label>
              <textarea
                value={resource.notes ?? ""}
                onChange={(e) => setResource({ ...resource, notes: e.target.value })}
                rows={6}
                className="input-focus mt-1.5 w-full resize-none rounded-2xl bg-zinc-50 px-4 py-2.5 text-sm ring-1 ring-zinc-200 transition-all focus:bg-white focus:ring-2 focus:ring-blue-500/40 dark:bg-zinc-900/60 dark:ring-zinc-700 dark:focus:bg-zinc-900 dark:focus:ring-blue-500/40"
              />
            </div>

            {error ? (
              <div className="animate-fade-in rounded-2xl bg-rose-500/10 p-3 text-sm font-medium text-rose-600 ring-1 ring-rose-500/20 dark:text-rose-400">
                {error}
              </div>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={save}
                disabled={saving}
                className="btn-press inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-3 text-sm font-bold text-white shadow-lg transition-all hover:from-blue-700 hover:to-violet-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save changes"}
              </button>
              <button
                onClick={remove}
                className="btn-press inline-flex items-center justify-center gap-2 rounded-2xl bg-zinc-100 px-4 py-3 text-sm font-semibold ring-1 ring-zinc-200 transition-all hover:bg-rose-50 hover:text-rose-600 hover:ring-rose-200 dark:bg-zinc-800/60 dark:ring-zinc-700 dark:hover:bg-rose-950/30 dark:hover:text-rose-400 dark:hover:ring-rose-900/50"
              >
                <Trash2 className="h-4 w-4" /> Delete
              </button>
            </div>
          </div>

          <div className="rounded-3xl bg-gradient-to-br from-blue-50/50 to-violet-50/50 p-5 ring-1 ring-zinc-200/50 dark:from-blue-950/20 dark:to-violet-950/20 dark:ring-zinc-700/50">
            <div className="flex items-center justify-between">
              <div className="text-base font-bold text-zinc-900 dark:text-zinc-50">Tags</div>
              <div className="rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-bold text-blue-600 ring-1 ring-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400">
                {resource.tags.length}
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <div className="relative flex-1">
                <Tag className="pointer-events-none absolute left-3.5 top-2.5 h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add tag (e.g. ai, docs)"
                  className="input-focus w-full rounded-2xl bg-zinc-50 py-2.5 pl-10 pr-3 text-sm ring-1 ring-zinc-200 transition-all focus:bg-white focus:ring-2 focus:ring-blue-500/40 dark:bg-zinc-900/60 dark:ring-zinc-700 dark:focus:bg-zinc-900 dark:focus:ring-blue-500/40"
                  list="all-tags"
                />
                <datalist id="all-tags">
                  {tags.map((t) => (
                    <option key={t} value={t} />
                  ))}
                </datalist>
              </div>
              <button
                onClick={addTag}
                className="btn-press rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:from-blue-700 hover:to-violet-700 hover:shadow-lg"
              >
                Add
              </button>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {resource.tags.map((t) => (
                <button
                  key={t}
                  onClick={() => removeTag(t)}
                  className="btn-press inline-flex items-center gap-2 rounded-full bg-white/80 px-3.5 py-2 text-xs font-semibold text-zinc-700 ring-1 ring-zinc-200 transition-all hover:bg-rose-50 hover:text-rose-600 hover:ring-rose-200 dark:bg-zinc-800/80 dark:text-zinc-300 dark:ring-zinc-700 dark:hover:bg-rose-950/50 dark:hover:text-rose-400 dark:hover:ring-rose-900/50"
                  title="Remove tag"
                >
                  {t} <X className="h-3.5 w-3.5" />
                </button>
              ))}
              {resource.tags.length === 0 ? (
                <div className="py-2 text-sm text-zinc-600 dark:text-zinc-400">No tags yet. Add one above!</div>
              ) : null}
            </div>

            <div className="mt-6 rounded-2xl bg-white/60 p-4 text-xs text-zinc-700 ring-1 ring-zinc-200/50 backdrop-blur-sm dark:bg-zinc-900/40 dark:text-zinc-300 dark:ring-zinc-700/50">
              <span className="font-semibold">💡 Pro tip:</span> Keep tags short and consistent (one or two words) for easier filtering.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
