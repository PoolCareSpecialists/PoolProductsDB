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
    description: formData.get("description") as string,
    status: formData.get("status") as string,
  };

  const specNotes = (formData.get("specNotes") as string)?.trim();
  const source = (formData.get("source") as string)?.trim();

  // Build diff — only include fields that actually changed
  const changes: Record<string, { from: string | null; to: string }> = {};

  const fields = ["name", "modelNumber", "upc", "sku", "description", "status"] as const;
  for (const field of fields) {
    const current = (product[field] ?? "") as string;
    const next = proposed[field]?.trim() ?? "";
    if (next && next !== current) {
      changes[field] = { from: current || null, to: next };
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
