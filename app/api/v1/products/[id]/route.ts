import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      brand: { include: { manufacturer: true } },
      category: { include: { parent: true } },
      images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }] },
      specs: { orderBy: { sortOrder: "asc" } },
      maintenanceSchedules: { orderBy: { sortOrder: "asc" } },
      documents: true,
      replacementPartsFrom: {
        include: {
          compatibleProduct: {
            include: {
              brand: true,
              images: { where: { isPrimary: true }, take: 1 },
            },
          },
        },
      },
      compatibleChemicalsFrom: {
        include: {
          chemicalProduct: {
            include: {
              brand: true,
              images: { where: { isPrimary: true }, take: 1 },
            },
          },
        },
      },
    },
  });

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json({ data: product });
}
