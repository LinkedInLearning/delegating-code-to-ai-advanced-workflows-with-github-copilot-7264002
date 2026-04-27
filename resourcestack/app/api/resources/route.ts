import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logToFile, newRequestId } from "@/lib/logger";
import { normalizeUrl } from "@/lib/normalizeUrl";
import { optionalString, requireNonEmptyString } from "@/lib/validators";

export async function GET(req: Request) {
  const requestId = newRequestId();
  const url = new URL(req.url);
  const search = url.searchParams.get("search") ?? "";
  const tag = url.searchParams.get("tag") ?? "";

  logToFile({ requestId, route: "GET /api/resources", event: "request", search, tag });

  const where: any = {};
  if (search.trim()) {
    where.OR = [
      { title: { contains: search } },
      { urlOriginal: { contains: search } },
      { notes: { contains: search } },
    ];
  }
  if (tag.trim()) {
    where.tags = { some: { tag: { name: tag } } };
  }

  const resources = await prisma.resource.findMany({
    where,
    orderBy: [{ title: "asc" }],
    include: {
      tags: { include: { tag: true } },
    },
    take: 200,
  });

  return NextResponse.json({
    resources: resources.map((r) => ({
      id: r.id,
      urlOriginal: r.urlOriginal,
      urlNormalized: r.urlNormalized,
      title: r.title,
      notes: r.notes,
      isFavorite: r.isFavorite,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      tags: r.tags.map((t) => t.tag.name),
    })),
  });
}

export async function POST(req: Request) {
  const requestId = newRequestId();
  const body = await req.json().catch(() => ({}));

  try {
    const urlOriginal = requireNonEmptyString(body.url, "url");
    const title = requireNonEmptyString(body.title, "title");
    const notes = optionalString(body.notes);

    const urlNormalized = normalizeUrl(urlOriginal);

    logToFile({
      requestId,
      route: "POST /api/resources",
      event: "normalize_url",
      input: urlOriginal,
      normalized: urlNormalized,
    });

    const existing = await prisma.resource.findUnique({ where: { urlNormalized } });
    if (existing) {
      logToFile({
        requestId,
        route: "POST /api/resources",
        event: "duplicate_blocked",
        existingId: existing.id,
      });
      return NextResponse.json({ error: "That URL already exists in your library." }, { status: 409 });
    }

    const created = await prisma.resource.create({
      data: {
        urlOriginal,
        urlNormalized,
        title,
        notes,
        activities: { create: { type: "created", message: `Created: ${title}` } },
      },
      include: { tags: { include: { tag: true } } },
    });

    return NextResponse.json({
      resource: {
        id: created.id,
        urlOriginal: created.urlOriginal,
        urlNormalized: created.urlNormalized,
        title: created.title,
        notes: created.notes,
        isFavorite: created.isFavorite,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
        tags: [],
      },
    });
  } catch (e: any) {
    logToFile({
      requestId,
      route: "POST /api/resources",
      event: "error",
      message: e?.message ?? "Unknown error",
    });
    return NextResponse.json({ error: e?.message ?? "Invalid request" }, { status: 400 });
  }
}
