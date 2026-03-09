import { clerkMiddleware, clerkClient, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isAuthRequired = createRouteMatcher([
  "/products/new",
  "/products/(.*)/suggest-edit",
]);

export default clerkMiddleware(async (auth, req) => {
  // Contribution routes — must be signed in
  if (isAuthRequired(req)) {
    await auth.protect();
    return;
  }

  // Admin routes — must be signed in AND have role: "admin" in Clerk publicMetadata
  // We fetch publicMetadata directly from the Clerk API so this works immediately
  // after setting the role in the Clerk dashboard (no need to wait for JWT expiry).
  if (isAdminRoute(req)) {
    const { userId } = await auth();
    if (!userId) {
      return (await auth.protect()) as unknown as NextResponse;
    }

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const role = (user.publicMetadata as { role?: string } | undefined)?.role;

    if (role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
