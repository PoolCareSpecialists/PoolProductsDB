"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { syncUser } from "@/lib/sync-user";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

function generateApiKey(): string {
  // Format: ppdb_live_<32 random hex chars>
  return `ppdb_live_${crypto.randomBytes(16).toString("hex")}`;
}

export async function createApiKey(name: string) {
  const { userId } = await auth();
  if (!userId) redirect("/account");

  const dbUser = await syncUser();
  if (!dbUser) redirect("/account");

  // Check existing key count (max 3 for free, 5 for paid)
  const existingCount = await prisma.apiKey.count({
    where: { userId: dbUser.id },
  });

  if (existingCount >= 5) {
    throw new Error("Maximum of 5 API keys per account");
  }

  const key = generateApiKey();

  await prisma.apiKey.create({
    data: {
      userId: dbUser.id,
      key,
      name: name?.trim() || "Default",
      plan: "FREE",
      dailyLimit: 100,
      monthlyLimit: 1000,
    },
  });

  revalidatePath("/api-keys");
  return key; // Return the key so user can copy it (only shown once)
}

export async function revokeApiKey(keyId: string) {
  const { userId } = await auth();
  if (!userId) redirect("/account");

  const dbUser = await syncUser();
  if (!dbUser) redirect("/account");

  // Ensure the key belongs to this user
  const apiKey = await prisma.apiKey.findFirst({
    where: { id: keyId, userId: dbUser.id },
  });

  if (!apiKey) throw new Error("API key not found");

  await prisma.apiKey.update({
    where: { id: keyId },
    data: { isActive: false },
  });

  revalidatePath("/api-keys");
}

export async function deleteApiKey(keyId: string) {
  const { userId } = await auth();
  if (!userId) redirect("/account");

  const dbUser = await syncUser();
  if (!dbUser) redirect("/account");

  const apiKey = await prisma.apiKey.findFirst({
    where: { id: keyId, userId: dbUser.id },
  });

  if (!apiKey) throw new Error("API key not found");

  await prisma.apiKey.delete({ where: { id: keyId } });

  revalidatePath("/api-keys");
}

export async function getApiKeyUsage(keyId: string) {
  const { userId } = await auth();
  if (!userId) return null;

  const dbUser = await syncUser();
  if (!dbUser) return null;

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [dailyUsage, monthlyUsage] = await Promise.all([
    prisma.apiUsage.aggregate({
      where: { apiKeyId: keyId, date: today },
      _sum: { requests: true },
    }),
    prisma.apiUsage.aggregate({
      where: {
        apiKeyId: keyId,
        date: { gte: firstOfMonth },
      },
      _sum: { requests: true },
    }),
  ]);

  return {
    daily: dailyUsage._sum.requests ?? 0,
    monthly: monthlyUsage._sum.requests ?? 0,
  };
}
