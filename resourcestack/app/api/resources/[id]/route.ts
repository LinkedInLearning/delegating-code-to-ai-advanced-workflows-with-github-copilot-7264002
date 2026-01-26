import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logToFile, newRequestId } from "@/lib/logger";
import { normalizeUrl } from "@/lib/normalizeUrl";
import { optionalString } from "@/lib/validators";

type Params = { params: { id: string } };

export async function GET(_req: Request, { params }: Params) {
  const r = await prisma.resource.findUnique({
    where: { id: params.id },
    include: { tags: { include: { tag: true } } },
  });
  if (!r) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    resource: {
      id: r.id,
      urlOriginal: r.urlOriginal,
      urlNormalized: r.urlNormalized,
      title: r.title,
      notes: r.notes,
      isFavorite: r.isFavorite,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      tags: r.tags.map((t) => t.tag.name),
    },
  });
}

export async function PATCH(req: Request, { params }: Params) {
  const requestId = newRequestId();
  const body = await req.json().catch(() => ({}));

  try {
    const updates: any = {};

    if (typeof body.title === "string") updates.title = body.title.trim();
    if ("notes" in body) updates.notes = optionalString(body.notes) ?? null;
    if (typeof body.isFavorite === "boolean") updates.isFavorite = body.isFavorite;

    if (typeof body.urlOriginal === "string" && body.urlOriginal.trim().length) {
      const urlOriginal = body.urlOriginal.trim();
      const urlNormalized = normalizeUrl(urlOriginal);

      logToFile({
        requestId,
        route: "PATCH /api/resources/:id",
        event: "normalize_url",
        input: urlOriginal,
        normalized: urlNormalized,
      });

      const dup = await prisma.resource.findUnique({ where: { urlNormalized } });
      if (dup && dup.id !== params.id) {
        return NextResponse.json({ error: "That URL already exists in your library." }, { status: 409 });
      }

      updates.urlOriginal = urlOriginal;
      updates.urlNormalized = urlNormalized;
    }

    const updated = await prisma.resource.update({
      where: { id: params.id },
      data: {
        ...updates,
        activities: { create: { type: "updated", message: `Updated: ${updates.title ?? "resource"}` } },
      },
      include: { tags: { include: { tag: true } } },
    });

    return NextResponse.json({
      resource: {
        id: updated.id,
        urlOriginal: updated.urlOriginal,
        urlNormalized: updated.urlNormalized,
        title: updated.title,
        notes: updated.notes,
        isFavorite: updated.isFavorite,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
        tags: updated.tags.map((t) => t.tag.name),
      },
    });
  } catch (e: any) {
    logToFile({
      requestId,
      route: "PATCH /api/resources/:id",
      event: "error",
      message: e?.message ?? "Unknown error",
    });
    return NextResponse.json({ error: e?.message ?? "Invalid request" }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const requestId = newRequestId();
  try {
    const existing = await prisma.resource.findUnique({ where: { id: params.id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.activity.create({
      data: { type: "deleted", message: `Deleted: ${existing.title}`, resourceId: existing.id },
    });

    await prisma.resource.delete({ where: { id: params.id } });

    logToFile({ requestId, route: "DELETE /api/resources/:id", event: "deleted", id: params.id });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    logToFile({
      requestId,
      route: "DELETE /api/resources/:id",
      event: "error",
      message: e?.message ?? "Unknown error",
    });
    return NextResponse.json({ error: e?.message ?? "Delete failed" }, { status: 400 });
  }
}
