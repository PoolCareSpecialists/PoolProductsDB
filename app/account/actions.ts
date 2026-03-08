"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { syncUser } from "@/lib/sync-user";
import { redirect } from "next/navigation";
import crypto from "crypto";

export async function generateApiKey() {
  const { userId } = await auth();
  if (!userId) redirect("/account");

  const dbUser = await syncUser();
  if (!dbUser) redirect("/account");

  // Generate a secure random key prefixed with "ppdb_"
  const key = "ppdb_" + crypto.randomBytes(32).toString("hex");

  await prisma.user.update({
    where: { id: dbUser.id },
    data: { apiKey: key },
  });

  redirect("/account");
}
