"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { syncUser } from "@/lib/sync-user";

export async function submitReview(
  productId: string,
  data: { rating: number; title?: string; body: string }
) {
  const dbUser = await syncUser();
  if (!dbUser) throw new Error("You must be signed in to leave a review.");

  if (data.rating < 1 || data.rating > 5)
    throw new Error("Rating must be between 1 and 5.");
  if (!data.body?.trim()) throw new Error("Review body is required.");

  await prisma.productReview.upsert({
    where: { productId_userId: { productId, userId: dbUser.id } },
    create: {
      productId,
      userId: dbUser.id,
      rating: data.rating,
      title: data.title?.trim() || null,
      body: data.body.trim(),
    },
    update: {
      rating: data.rating,
      title: data.title?.trim() || null,
      body: data.body.trim(),
    },
  });

  revalidatePath(`/products/${productId}`);
}

export async function deleteReview(reviewId: string) {
  const dbUser = await syncUser();
  if (!dbUser) throw new Error("Not authenticated.");

  const review = await prisma.productReview.findUnique({
    where: { id: reviewId },
  });
  if (!review) throw new Error("Review not found.");

  const isOwner = review.userId === dbUser.id;
  const isAdmin = dbUser.role === "ADMIN";
  if (!isOwner && !isAdmin) throw new Error("Not authorized to delete this review.");

  await prisma.productReview.delete({ where: { id: reviewId } });
  revalidatePath(`/products/${review.productId}`);
}
