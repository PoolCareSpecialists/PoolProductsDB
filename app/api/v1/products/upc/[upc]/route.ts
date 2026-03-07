import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ upc: string }> }
) {
  const { upc } = await params;

  const product = await prisma.product.findUnique({
    where: { upc },
    include: {
      brand: { include: { manufacturer: true } },
      category: { include: { parent: true } },
      images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }] },
      specs: { orderBy: { sortOrder: "asc" } },
      maintenanceSchedules: { orderBy: { sortOrder: "asc" } },
      documents: true,
    },
  });

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json({ data: product });
}
