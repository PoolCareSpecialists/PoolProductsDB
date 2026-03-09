"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { syncUser } from "@/lib/sync-user";
import { redirect } from "next/navigation";

export async function submitSuggestEdit(productId: string, formData: FormData) {
  const { userId } = await auth();
  if (!userId) redirect(`/account`);

  const dbUser = await syncUser();
  if (!dbUser) redirect(`/account`);

  // Fetch current product for diffing
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) redirect("/products");

  const proposed = {
    name: formData.get("name") as string,
    modelNumber: formData.get("modelNumber") as string,
    upc: formData.get("upc") as string,
    sku: formData.get("sku") as string,
    ean: formData.get("ean") as string,
    asin: formData.get("asin") as string,
    description: formData.get("description") as string,
    status: formData.get("status") as string,
    msrp: formData.get("msrp") as string,
    map: formData.get("map") as string,
    dimensions: formData.get("dimensions") as string,
    weight: formData.get("weight") as string,
    countryOfOrigin: formData.get("countryOfOrigin") as string,
    warrantyYears: formData.get("warrantyYears") as string,
    releaseDate: formData.get("releaseDate") as string,
  };

  const featuresRaw = (formData.get("features") as string)?.trim();
  const certificationsRaw = (formData.get("certifications") as string)?.trim();
  const specNotes = (formData.get("specNotes") as string)?.trim();
  const source = (formData.get("source") as string)?.trim();

  // Build diff — only include fields that actually changed
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const changes: Record<string, { from: any; to: any }> = {};

  // String fields
  const stringFields = [
    "name", "modelNumber", "upc", "sku", "ean", "asin",
    "description", "status", "dimensions", "weight", "countryOfOrigin",
  ] as const;
  for (const field of stringFields) {
    const current = (product[field] ?? "") as string;
    const next = proposed[field]?.trim() ?? "";
    if (next && next !== current) {
      changes[field] = { from: current || null, to: next };
    }
  }

  // Decimal fields (msrp, map)
  for (const field of ["msrp", "map"] as const) {
    const next = proposed[field]?.trim();
    if (next) {
      const num = parseFloat(next.replace(/[$,]/g, ""));
      if (!isNaN(num)) {
        const current = product[field] ? Number(product[field]) : null;
        if (current !== num) {
          changes[field] = { from: current, to: num };
        }
      }
    }
  }

  // Integer field: warrantyYears
  if (proposed.warrantyYears?.trim()) {
    const num = parseInt(proposed.warrantyYears.trim(), 10);
    if (!isNaN(num) && num !== product.warrantyYears) {
      changes.warrantyYears = { from: product.warrantyYears, to: num };
    }
  }

  // Date field: releaseDate (YYYY-MM format)
  if (proposed.releaseDate?.trim()) {
    const dateStr = proposed.releaseDate.trim();
    const parsed = new Date(dateStr.length === 7 ? `${dateStr}-01` : dateStr);
    if (!isNaN(parsed.getTime())) {
      const currentDate = product.releaseDate ? product.releaseDate.toISOString() : null;
      changes.releaseDate = { from: currentDate, to: parsed.toISOString() };
    }
  }

  // Array field: features (one per line)
  if (featuresRaw) {
    const newFeatures = featuresRaw.split("\n").map((f) => f.trim()).filter(Boolean);
    if (newFeatures.length > 0) {
      changes.features = { from: product.features, to: newFeatures };
    }
  }

  // Array field: certifications (comma-separated)
  if (certificationsRaw) {
    const newCerts = certificationsRaw.split(",").map((c) => c.trim()).filter(Boolean);
    if (newCerts.length > 0) {
      changes.certifications = { from: product.certifications, to: newCerts };
    }
  }

  const hasChanges = Object.keys(changes).length > 0 || specNotes;

  if (!hasChanges) {
    redirect(`/products/${productId}?edit=nochange`);
  }

  await prisma.pendingEdit.create({
    data: {
      productId,
      submittedById: dbUser.id,
      fieldChanges: {
        type: "product_edit",
        changes,
        specNotes: specNotes || null,
        source: source || null,
      },
    },
  });

  redirect(`/products/${productId}?edit=submitted`);
}
