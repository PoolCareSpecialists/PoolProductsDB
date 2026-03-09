import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

/**
 * Syncs the currently signed-in Clerk user to the local DB User table.
 * Creates a new DB user if one doesn't exist, updates name/email/role if changed.
 * Role is sourced from Clerk publicMetadata: { role: "admin" } → ADMIN, else CONTRIBUTOR.
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

  // Sync role from Clerk publicMetadata → DB UserRole enum
  const clerkRole = (clerkUser.publicMetadata as { role?: string } | undefined)
    ?.role;
  const role: "ADMIN" | "CONTRIBUTOR" =
    clerkRole?.toLowerCase() === "admin" ? "ADMIN" : "CONTRIBUTOR";

  const dbUser = await prisma.user.upsert({
    where: { clerkId: clerkUser.id },
    update: { email, name, role },
    create: {
      clerkId: clerkUser.id,
      email,
      name,
      role,
    },
  });

  return dbUser;
}
