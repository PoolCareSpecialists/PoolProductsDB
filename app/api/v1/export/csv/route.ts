import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateApiKey } from "@/lib/api-auth";

// CSV Export — requires DEVELOPER plan or above
const ALLOWED_PLANS = new Set(["DEVELOPER", "STARTUP", "ENTERPRISE"]);

export async function GET(request: NextRequest) {
  const authResult = await validateApiKey(request);
  if (authResult instanceof NextResponse) return authResult;

  if (!ALLOWED_PLANS.has(authResult.plan)) {
    return NextResponse.json(
      {
        error: "Plan upgrade required",
        message:
          "CSV export is available on Developer plans and above. Visit /pricing to upgrade.",
        currentPlan: authResult.plan,
      },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const brand = searchParams.get("brand");
  const status = searchParams.get("status");
  const limit = Math.min(10000, Math.max(1, parseInt(searchParams.get("limit") ?? "1000")));

  const products = await prisma.product.findMany({
    where: {
      ...(category && { category: { slug: category } }),
      ...(brand && {
        brand: { name: { contains: brand, mode: "insensitive" as const } },
      }),
      ...(status && { status: status as "ACTIVE" | "DISCONTINUED" | "UNKNOWN" }),
    },
    include: {
      brand: { include: { manufacturer: true } },
      category: { include: { parent: true } },
      specs: { orderBy: { sortOrder: "asc" } },
    },
    orderBy: { name: "asc" },
    take: limit,
  });

  // Build CSV
  const headers = [
    "id",
    "name",
    "manufacturer",
    "brand",
    "category",
    "parent_category",
    "model_number",
    "upc",
    "ean",
    "asin",
    "sku",
    "status",
    "msrp",
    "map",
    "description",
    "features",
    "dimensions",
    "weight",
    "country_of_origin",
    "warranty_years",
    "certifications",
    "release_date",
    "specs",
  ];

  const rows = products.map((p) => [
    p.id,
    p.name,
    p.brand.manufacturer.name,
    p.brand.name,
    p.category.name,
    p.category.parent?.name ?? "",
    p.modelNumber ?? "",
    p.upc ?? "",
    p.ean ?? "",
    p.asin ?? "",
    p.sku ?? "",
    p.status,
    p.msrp ? Number(p.msrp).toFixed(2) : "",
    p.map ? Number(p.map).toFixed(2) : "",
    p.description ?? "",
    p.features.join("; "),
    p.dimensions ?? "",
    p.weight ?? "",
    p.countryOfOrigin ?? "",
    p.warrantyYears?.toString() ?? "",
    p.certifications.join("; "),
    p.releaseDate ? p.releaseDate.toISOString().split("T")[0] : "",
    p.specs.map((s) => `${s.specKey}=${s.specValue}${s.unit ? ` ${s.unit}` : ""}`).join("; "),
  ]);

  function escapeCsv(val: string): string {
    if (val.includes(",") || val.includes('"') || val.includes("\n")) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  }

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map(escapeCsv).join(",")),
  ].join("\n");

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="pool-products-export-${
        new Date().toISOString().split("T")[0]
      }.csv"`,
      "X-Total-Count": String(products.length),
    },
  });
}
