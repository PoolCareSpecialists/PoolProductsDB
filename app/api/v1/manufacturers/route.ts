import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";

  const manufacturers = await prisma.manufacturer.findMany({
    where: query
      ? { name: { contains: query, mode: "insensitive" } }
      : undefined,
    include: { brands: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ data: manufacturers });
}
