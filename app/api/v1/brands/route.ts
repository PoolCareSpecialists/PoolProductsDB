import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const manufacturerId = searchParams.get("manufacturerId");

  const brands = await prisma.brand.findMany({
    where: manufacturerId ? { manufacturerId } : undefined,
    include: {
      manufacturer: {
        select: { id: true, name: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(
    brands.map((b) => ({
      id: b.id,
      name: b.name,
      manufacturerId: b.manufacturerId,
      manufacturer: b.manufacturer,
    }))
  );
}
