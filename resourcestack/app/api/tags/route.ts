import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireNonEmptyString } from "@/lib/validators";

export async function GET() {
  const tags = await prisma.tag.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json({ tags: tags.map((t) => t.name) });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  try {
    const name = requireNonEmptyString(body.name, "name");
    const tag = await prisma.tag.upsert({ where: { name }, update: {}, create: { name } });
    return NextResponse.json({ tag: tag.name });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Invalid request" }, { status: 400 });
  }
}
