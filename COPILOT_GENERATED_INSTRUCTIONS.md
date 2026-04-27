# Copilot Generated Instructions — ResourceStack

ResourceStack is a personal bookmark/resource-management app built with **Next.js 14**, **Prisma + SQLite**, and **Tailwind CSS**. This is also a LinkedIn Learning course project; branches map to course chapters (`02_03b` / `02_03e` = chapter 2, video 3, before/end).

## Commands

All commands run from `resourcestack/` (the Next.js project root):

| Purpose | Command |
|---------|---------|
| Dev server | `npm run dev` |
| One-off test run | `npm run gp:test` |
| Watch-mode tests | `npm run test` |
| Lint | `npm run lint` |
| Full setup (install → migrate → seed → smoke) | `npm run gp:setup` |
| Prisma CLI | `npm run prisma -- <args>` |

> Use `gp:*` scripts when automating tasks. Do not invent commands.

## Architecture

```
app/
  api/              # REST API routes (resources, tags, activity)
  resources/        # Next.js pages (list + detail)
components/         # Client components ("use client")
lib/
  api.ts            # Generic typed fetch wrapper for client → API calls
  db.ts             # Prisma singleton (globalThis-cached for HMR safety)
  validators.ts     # Lightweight throw-on-error validators
  normalizeUrl.ts   # URL canonicalization (http/https only)
  logger.ts         # Request-scoped logging with requestId
prisma/
  schema.prisma     # SQLite schema: Resource, Tag, ResourceTag, Activity
  seed.ts           # Seed data
tests/              # Vitest tests; import via `@/` alias
```

## Key Conventions

- **API error shape**: `{ error: "message" }` with appropriate HTTP status codes.
- **Tag storage**: Always lowercase. Tags are upserted, not re-created.
- **Duplicate detection**: Uses `urlNormalized` (unique constraint). See `lib/normalizeUrl.ts`.
- **Activity log**: Every resource mutation (create/update/delete/tag) appends an `Activity` record _before_ the mutation.
- **Relation shape**: API responses flatten `ResourceTag` → `tags: string[]`. Don't return raw join-table objects.
- **No caching**: `apiFetch` always passes `cache: "no-store"`.
- **Prisma singleton**: Always import `prisma` from `lib/db.ts`, never instantiate directly.
- **Path alias**: Use `@/` for imports within `resourcestack/` (maps to `resourcestack/`).

## Known Intentional Issue

`normalizeUrl` does **not** strip trailing slashes — `https://example.com` and `https://example.com/` are treated as different URLs. This is a deliberate course exercise. Do not silently fix it unless that is explicitly requested; there is a failing test that documents it.

## Constraints

- Do not delete or modify tests to make builds pass.
- Do not add service workers or offline caching unless explicitly requested.
- Tag filtering must work via both tag chips and the dropdown; dark/light mode toggle must persist.
- Explain tradeoffs before making changes when the right approach is unclear.
