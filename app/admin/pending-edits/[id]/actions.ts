"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { syncUser } from "@/lib/sync-user";
import { redirect } from "next/navigation";

type FieldChanges = Record<string, unknown>;
type NewProductData = {
  manufacturerName?: string;
  brandName?: string;
  name: string;
  modelNumber?: string | null;
  upc?: string | null;
  sku?: string | null;
  categoryId?: string | null;
  status?: string;
  description?: string | null;
  specs?: { specKey: string; specValue: string; unit?: string }[];
  maintenance?: {
    taskName: string;
    intervalValue: string;
    intervalUnit: string;
    notes?: string;
  }[];
  documents?: { type: string; title: string; externalUrl: string }[];
};

export async function approveEdit(editId: string, formData: FormData) {
  const dbUser = await syncUser();
  if (!dbUser || dbUser.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const reviewNotes = (formData.get("reviewNotes") as string)?.trim() || null;

  const edit = await prisma.pendingEdit.findUnique({
    where: { id: editId },
  });

  if (!edit) throw new Error("Edit not found");

  const fieldChanges = edit.fieldChanges as FieldChanges;
  const editType = fieldChanges.type as string;

  if (editType === "product_edit" && edit.productId) {
    const changes = (fieldChanges.changes ?? {}) as Record<
      string,
      { from: string | null; to: string }
    >;

    const updateData: Record<string, string> = {};
    for (const [field, change] of Object.entries(changes)) {
      updateData[field] = change.to;
    }

    await prisma.$transaction([
      prisma.product.update({
        where: { id: edit.productId },
        data: updateData,
      }),
      prisma.editHistory.create({
        data: {
          productId: edit.productId,
          changedById: dbUser.id,
          fieldChanges: fieldChanges as Prisma.InputJsonValue,
        },
      }),
    ]);
  } else if (editType === "new_product") {
    const data = fieldChanges.data as NewProductData;

    let manufacturerId: string;
    if (data.manufacturerName) {
      const existingManufacturer = await prisma.manufacturer.findFirst({
        where: { name: { equals: data.manufacturerName, mode: "insensitive" } },
      });
      if (existingManufacturer) {
        manufacturerId = existingManufacturer.id;
      } else {
        const newManufacturer = await prisma.manufacturer.create({
          data: { name: data.manufacturerName },
        });
        manufacturerId = newManufacturer.id;
      }
    } else {
      throw new Error("Manufacturer name is required");
    }

    let brandId: string;
    if (data.brandName) {
      const existingBrand = await prisma.brand.findFirst({
        where: {
          manufacturerId,
          name: { equals: data.brandName, mode: "insensitive" },
        },
      });
      if (existingBrand) {
        brandId = existingBrand.id;
      } else {
        const newBrand = await prisma.brand.create({
          data: { name: data.brandName, manufacturerId },
        });
        brandId = newBrand.id;
      }
    } else {
      throw new Error("Brand name is required");
    }

    // Resolve categoryId — use provided or fall back to a default
    let categoryId = data.categoryId ?? null;
    if (!categoryId) {
      // Try to find any existing category as fallback
      const anyCategory = await prisma.category.findFirst({ orderBy: { name: "asc" } });
      if (anyCategory) categoryId = anyCategory.id;
    }
    if (!categoryId) throw new Error("No category available");

    const product = await prisma.product.create({
      data: {
        name: data.name,
        brandId,
        categoryId,
        modelNumber: data.modelNumber ?? null,
        upc: data.upc ?? null,
        sku: data.sku ?? null,
        description: data.description ?? null,
        status: (data.status as "ACTIVE" | "DISCONTINUED" | "UNKNOWN") ?? "ACTIVE",
        createdById: dbUser.id,
      },
    });

    const specs = data.specs ?? [];
    const maintenance = data.maintenance ?? [];
    const documents = data.documents ?? [];

    await Promise.all([
      specs.length > 0
        ? prisma.productSpec.createMany({
            data: specs.map((s, i) => ({
              productId: product.id,
              specKey: s.specKey,
              specValue: s.specValue,
              unit: s.unit ?? null,
              sortOrder: i,
            })),
          })
        : Promise.resolve(),
      maintenance.length > 0
        ? prisma.maintenanceSchedule.createMany({
            data: maintenance.map((m, i) => ({
              productId: product.id,
              taskName: m.taskName,
              intervalValue: parseInt(m.intervalValue, 10) || 1,
              intervalUnit: m.intervalUnit,
              notes: m.notes ?? null,
              sortOrder: i,
            })),
          })
        : Promise.resolve(),
      documents.length > 0
        ? prisma.document.createMany({
            data: documents.map((d) => ({
              productId: product.id,
              type: d.type as
                | "MANUAL"
                | "SPEC_SHEET"
                | "WARRANTY"
                | "INSTALLATION_GUIDE"
                | "PARTS_LIST"
                | "OTHER",
              title: d.title,
              externalUrl: d.externalUrl,
              uploadedById: dbUser.id,
            })),
          })
        : Promise.resolve(),
      prisma.editHistory.create({
        data: {
          productId: product.id,
          changedById: dbUser.id,
          fieldChanges: { type: "new_product_approved", data },
        },
      }),
    ]);

    // Update the pending edit with the new productId
    await prisma.pendingEdit.update({
      where: { id: editId },
      data: {
        productId: product.id,
        status: "APPROVED",
        reviewedById: dbUser.id,
        reviewedAt: new Date(),
        reviewNotes,
      },
    });

    redirect("/admin/pending-edits");
  }

  await prisma.pendingEdit.update({
    where: { id: editId },
    data: {
      status: "APPROVED",
      reviewedById: dbUser.id,
      reviewedAt: new Date(),
      reviewNotes,
    },
  });

  redirect("/admin/pending-edits");
}

export async function rejectEdit(editId: string, formData: FormData) {
  const dbUser = await syncUser();
  if (!dbUser || dbUser.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const reviewNotes = (formData.get("reviewNotes") as string)?.trim() || null;

  await prisma.pendingEdit.update({
    where: { id: editId },
    data: {
      status: "REJECTED",
      reviewedById: dbUser.id,
      reviewedAt: new Date(),
      reviewNotes,
    },
  });

  redirect("/admin/pending-edits");
}
