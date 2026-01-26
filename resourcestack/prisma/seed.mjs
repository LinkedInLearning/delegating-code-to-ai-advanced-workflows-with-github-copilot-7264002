import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Keep this small and deterministic. Matches lib/normalizeUrl.ts behavior (including known bug for the course).
function normalizeUrl(input) {
  const url = new URL(input);
  const protocol = url.protocol.toLowerCase();
  if (protocol !== "http:" && protocol !== "https:") throw new Error("Only http(s) URLs are allowed");
  const host = url.host.toLowerCase();
  // Intentionally DOES NOT remove trailing slash. (Seeded bug for debugging module.)
  const pathname = url.pathname || "/";
  const search = url.search || "";
  return `${protocol}//${host}${pathname}${search}`;
}

async function main() {
  const tags = ["AI", "Career", "Docs", "Tools", "Learning"];
  for (const name of tags) {
    await prisma.tag.upsert({ where: { name }, update: {}, create: { name } });
  }

  const sample = [
    { url: "https://nextjs.org/docs", title: "Next.js Docs", notes: "App Router, routing, and server rendering." },
    { url: "https://www.prisma.io/docs", title: "Prisma Docs", notes: "Schema, migrations, queries." },
    { url: "https://vitest.dev", title: "Vitest", notes: "Fast unit tests for JS/TS." }
  ];

  for (const item of sample) {
    const urlNormalized = normalizeUrl(item.url);
    await prisma.resource.upsert({
      where: { urlNormalized },
      update: {},
      create: {
        urlOriginal: item.url,
        urlNormalized,
        title: item.title,
        notes: item.notes,
        activities: { create: { type: "created", message: `Seeded: ${item.title}` } }
      }
    });
  }
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
