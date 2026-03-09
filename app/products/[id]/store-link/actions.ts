"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { syncUser } from "@/lib/sync-user";

export const POOL_RETAILERS = [
  "Leslie's Pool Supply",
  "InTheSwim",
  "Pool Supply World",
  "Amazon",
  "Walmart",
  "Home Depot",
  "eBay",
  "Manufacturer Direct",
  "Poolstore",
  "PoolSpaMarket",
  "Other",
] as const;

export async function submitStoreLink(
  productId: string,
  data: { storeName: string; storeUrl: string; price?: string; currency?: string }
) {
  const dbUser = await syncUser();
  if (!dbUser) throw new Error("You must be signed in to add a store link.");

  if (!data.storeName?.trim()) throw new Error("Store name is required.");
  if (!data.storeUrl?.trim()) throw new Error("Store URL is required.");

  // Basic URL validation
  try {
    new URL(data.storeUrl);
  } catch {
    throw new Error("Please enter a valid URL (must start with https://).");
  }

  const price = data.price ? parseFloat(data.price) : null;
  if (data.price && (isNaN(price!) || price! < 0))
    throw new Error("Price must be a positive number.");

  await prisma.storeLink.create({
    data: {
      productId,
      addedById: dbUser.id,
      storeName: data.storeName.trim(),
      storeUrl: data.storeUrl.trim(),
      price: price ?? null,
      currency: data.currency || "USD",
    },
  });

  revalidatePath(`/products/${productId}`);
}

export async function deleteStoreLink(storeLinkId: string) {
  const dbUser = await syncUser();
  if (!dbUser) throw new Error("Not authenticated.");

  const link = await prisma.storeLink.findUnique({ where: { id: storeLinkId } });
  if (!link) throw new Error("Store link not found.");

  const isOwner = link.addedById === dbUser.id;
  const isAdmin = dbUser.role === "ADMIN";
  if (!isOwner && !isAdmin) throw new Error("Not authorized.");

  await prisma.storeLink.delete({ where: { id: storeLinkId } });
  revalidatePath(`/products/${link.productId}`);
}
