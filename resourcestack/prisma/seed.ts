import { PrismaClient } from "@prisma/client";
import { normalizeUrl } from "../lib/normalizeUrl";

const prisma = new PrismaClient();

async function main() {
  const tags = ["AI", "Career", "Docs", "Tools", "Learning"];
  for (const name of tags) {
    await prisma.tag.upsert({
      where: { name },
      update: {},
      create: { name },
    });
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
        activities: {
          create: { type: "created", message: `Seeded: ${item.title}` }
        }
      }
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
