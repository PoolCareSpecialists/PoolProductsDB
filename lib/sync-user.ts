import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

/**
 * Syncs the currently signed-in Clerk user to the local DB User table.
 * Creates a new DB user if one doesn't exist, updates name/email if changed.
 * Returns the DB user record, or null if not signed in.
 */
export async function syncUser() {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const email =
    clerkUser.emailAddresses[0]?.emailAddress ?? "";
  const name =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
    clerkUser.username ||
    email;

  const dbUser = await prisma.user.upsert({
    where: { clerkId: clerkUser.id },
    update: { email, name },
    create: {
      clerkId: clerkUser.id,
      email,
      name,
    },
  });

  return dbUser;
}
