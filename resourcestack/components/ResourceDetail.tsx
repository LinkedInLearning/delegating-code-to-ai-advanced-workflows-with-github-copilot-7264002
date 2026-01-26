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
    const name = tagInput.trim().toLowerCase();
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
      <div className="rounded-3xl bg-zinc-900/50 p-6 ring-1 ring-white/10">
        <div className="text-sm text-zinc-300">Loading...</div>
        {error ? <div className="mt-3 rounded-2xl bg-rose-500/10 p-3 text-sm text-rose-200 ring-1 ring-rose-400/20">{error}</div> : null}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Link href="/resources" className="inline-flex items-center gap-2 rounded-2xl bg-zinc-900/60 px-3 py-2 text-sm no-underline ring-1 ring-white/10 hover:bg-zinc-900/80">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <a
          href={resource.urlOriginal}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-2xl bg-white px-3 py-2 text-sm font-semibold text-zinc-950 no-underline hover:bg-zinc-100"
        >
          <ExternalLink className="h-4 w-4" /> Open link
        </a>
      </div>

      <div className="rounded-3xl bg-zinc-900/50 p-6 shadow-soft ring-1 ring-white/10">
        <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
          <div className="space-y-4">
            <div>
              <label className="text-xs text-zinc-300">Title</label>
              <input
                value={resource.title}
                onChange={(e) => setResource({ ...resource, title: e.target.value })}
                className="mt-1 w-full rounded-2xl bg-zinc-950/60 px-3 py-2 text-sm ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-white/20"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-300">URL</label>
              <input
                value={resource.urlOriginal}
                onChange={(e) => setResource({ ...resource, urlOriginal: e.target.value })}
                className="mt-1 w-full rounded-2xl bg-zinc-950/60 px-3 py-2 text-sm ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-white/20"
              />
              <div className="mt-1 text-xs text-zinc-400">
                Duplicate detection uses a normalized version of this URL.
              </div>
            </div>
            <div>
              <label className="text-xs text-zinc-300">Notes</label>
              <textarea
                value={resource.notes ?? ""}
                onChange={(e) => setResource({ ...resource, notes: e.target.value })}
                rows={6}
                className="mt-1 w-full resize-none rounded-2xl bg-zinc-950/60 px-3 py-2 text-sm ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-white/20"
              />
            </div>

            {error ? <div className="rounded-2xl bg-rose-500/10 p-3 text-sm text-rose-200 ring-1 ring-rose-400/20">{error}</div> : null}

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                onClick={save}
                disabled={saving}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-white px-3 py-2 text-sm font-semibold text-zinc-950 hover:bg-zinc-100 disabled:opacity-60"
              >
                <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save changes"}
              </button>
              <button
                onClick={remove}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-zinc-950/60 px-3 py-2 text-sm ring-1 ring-white/10 hover:bg-zinc-950/80"
              >
                <Trash2 className="h-4 w-4" /> Delete
              </button>
            </div>
          </div>

          <div className="rounded-3xl bg-zinc-950/40 p-5 ring-1 ring-white/10">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Tags</div>
              <div className="text-xs text-zinc-400">{resource.tags.length}</div>
            </div>

            <div className="mt-4 flex gap-2">
              <div className="relative flex-1">
                <Tag className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add a tag (ex: ai)"
                  className="w-full rounded-2xl bg-zinc-950/60 py-2 pl-9 pr-3 text-sm ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-white/20"
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
                className="rounded-2xl bg-white px-3 py-2 text-sm font-semibold text-zinc-950 hover:bg-zinc-100"
              >
                Add
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {resource.tags.map((t) => (
                <button
                  key={t}
                  onClick={() => removeTag(t)}
                  className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs text-zinc-200 ring-1 ring-white/10 hover:bg-white/15"
                  title="Remove tag"
                >
                  {t} <X className="h-3.5 w-3.5 text-zinc-300" />
                </button>
              ))}
              {resource.tags.length === 0 ? (
                <div className="text-sm text-zinc-300">No tags yet.</div>
              ) : null}
            </div>

            <div className="mt-6 rounded-2xl bg-zinc-900/40 p-3 text-xs text-zinc-300 ring-1 ring-white/10">
              Tip: Keep tags short and consistent (one or two words).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
