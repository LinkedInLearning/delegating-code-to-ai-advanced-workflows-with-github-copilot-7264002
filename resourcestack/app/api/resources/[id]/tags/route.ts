import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireNonEmptyString } from "@/lib/validators";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Params) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  try {
    const name = requireNonEmptyString(body.name, "name").toLowerCase();
    const tag = await prisma.tag.upsert({ where: { name }, update: {}, create: { name } });

    await prisma.resourceTag.upsert({
      where: { resourceId_tagId: { resourceId: id, tagId: tag.id } },
      create: { resourceId: id, tagId: tag.id },
      update: {},
    });

    await prisma.activity.create({
      data: { type: "tagged", message: `Tagged with: ${tag.name}`, resourceId: id },
    });

    return NextResponse.json({ tag: tag.name });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Invalid request" }, { status: 400 });
  }
}

export async function DELETE(req: Request, { params }: Params) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  try {
    const name = requireNonEmptyString(body.name, "name").toLowerCase();
    const tag = await prisma.tag.findUnique({ where: { name } });
    if (!tag) return NextResponse.json({ error: "Tag not found" }, { status: 404 });

    await prisma.resourceTag.delete({
      where: { resourceId_tagId: { resourceId: id, tagId: tag.id } },
    });

    await prisma.activity.create({
      data: { type: "untagged", message: `Removed tag: ${tag.name}`, resourceId: id },
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Invalid request" }, { status: 400 });
  }
}
