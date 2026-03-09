"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { syncUser } from "@/lib/sync-user";
import { redirect } from "next/navigation";

export async function submitNewProduct(formData: FormData) {
  const { userId } = await auth();
  if (!userId) redirect("/account");

  const dbUser = await syncUser();
  if (!dbUser) redirect("/account");

  const manufacturerName = (formData.get("manufacturerName") as string)?.trim();
  const brandName = (formData.get("brandName") as string)?.trim();
  const name = (formData.get("name") as string)?.trim();
  const modelNumber = (formData.get("modelNumber") as string)?.trim() || null;
  const upc = (formData.get("upc") as string)?.trim() || null;
  const sku = (formData.get("sku") as string)?.trim() || null;
  const ean = (formData.get("ean") as string)?.trim() || null;
  const asin = (formData.get("asin") as string)?.trim() || null;
  const categoryId = (formData.get("categoryId") as string)?.trim() || null;
  const status = (formData.get("status") as string)?.trim() || "ACTIVE";
  const description = (formData.get("description") as string)?.trim() || null;

  // Pricing
  const msrpStr = (formData.get("msrp") as string)?.trim();
  const msrp = msrpStr ? parseFloat(msrpStr) : null;
  const mapStr = (formData.get("map") as string)?.trim();
  const map = mapStr ? parseFloat(mapStr) : null;

  // Physical details
  const dimensions = (formData.get("dimensions") as string)?.trim() || null;
  const weight = (formData.get("weight") as string)?.trim() || null;
  const countryOfOrigin = (formData.get("countryOfOrigin") as string)?.trim() || null;
  const warrantyStr = (formData.get("warrantyYears") as string)?.trim();
  const warrantyYears = warrantyStr ? parseInt(warrantyStr, 10) : null;
  const releaseDateStr = (formData.get("releaseDate") as string)?.trim();
  const releaseDate = releaseDateStr ? new Date(`${releaseDateStr}-01`).toISOString() : null;

  // Arrays
  let features: string[] = [];
  let certifications: string[] = [];
  try {
    features = JSON.parse((formData.get("featuresJson") as string) || "[]");
  } catch {
    features = [];
  }
  try {
    certifications = JSON.parse((formData.get("certificationsJson") as string) || "[]");
  } catch {
    certifications = [];
  }

  const specsRaw = formData.get("specs") as string;
  const maintenanceRaw = formData.get("maintenance") as string;
  const documentsRaw = formData.get("documents") as string;

  let specs: { specKey: string; specValue: string; unit: string }[] = [];
  let maintenance: { taskName: string; intervalValue: string; intervalUnit: string; notes: string }[] = [];
  let documents: { type: string; title: string; externalUrl: string }[] = [];

  try {
    specs = specsRaw ? JSON.parse(specsRaw) : [];
  } catch {
    specs = [];
  }
  try {
    maintenance = maintenanceRaw ? JSON.parse(maintenanceRaw) : [];
  } catch {
    maintenance = [];
  }
  try {
    documents = documentsRaw ? JSON.parse(documentsRaw) : [];
  } catch {
    documents = [];
  }

  await prisma.pendingEdit.create({
    data: {
      productId: null,
      submittedById: dbUser.id,
      fieldChanges: {
        type: "new_product",
        data: {
          manufacturerName,
          brandName,
          name,
          modelNumber,
          upc,
          sku,
          ean,
          asin,
          categoryId,
          status,
          description,
          msrp: msrp && !isNaN(msrp) ? msrp : null,
          map: map && !isNaN(map) ? map : null,
          dimensions,
          weight,
          countryOfOrigin,
          warrantyYears: warrantyYears && !isNaN(warrantyYears) ? warrantyYears : null,
          releaseDate,
          features,
          certifications,
          specs: specs.filter((s) => s.specKey?.trim() && s.specValue?.trim()),
          maintenance: maintenance.filter((m) => m.taskName?.trim() && m.intervalValue),
          documents: documents.filter((d) => d.title?.trim() && d.externalUrl?.trim()),
        },
      },
    },
  });

  redirect("/products/new?submitted=1");
}
