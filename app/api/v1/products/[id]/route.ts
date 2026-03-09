import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateApiKey } from "@/lib/api-auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await validateApiKey(request);
  if (authResult instanceof NextResponse) return authResult;

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
      storeLinks: { orderBy: { createdAt: "desc" } },
      _count: { select: { reviews: true } },
      reviews: {
        select: {
          id: true,
          rating: true,
          title: true,
          body: true,
          createdAt: true,
          user: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
      : null;

  return NextResponse.json({
    data: {
      ...product,
      avgRating: avgRating ? Math.round(avgRating * 10) / 10 : null,
    },
  });
}
