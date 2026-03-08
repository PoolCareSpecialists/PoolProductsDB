import { SignIn } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Key } from "lucide-react";
import { syncUser } from "@/lib/sync-user";
import { generateApiKey } from "@/app/account/actions";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";

export const metadata = { title: "My Account" };

export default async function AccountPage() {
  const { userId } = await auth();

  // Not signed in — show Clerk sign-in widget
  if (!userId) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] py-12 px-4">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold mb-2 text-center">Sign In</h1>
          <p className="text-muted-foreground text-sm text-center mb-6">
            Sign in to contribute to the database and manage your API keys.
          </p>
          <SignIn routing="hash" />
        </div>
      </div>
    );
  }

  // Signed in — sync user to DB and show account info
  const dbUser = await syncUser();
  if (!dbUser) redirect("/");

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <h1 className="text-2xl font-bold mb-1">My Account</h1>
      <p className="text-muted-foreground mb-8 text-sm">{dbUser.email}</p>

      {/* Profile */}
      <section className="rounded-lg border bg-card p-5 mb-6">
        <h2 className="font-semibold mb-3">Profile</h2>
        <div className="space-y-1 text-sm">
          <div className="flex gap-2">
            <span className="text-muted-foreground w-20">Name</span>
            <span>{dbUser.name ?? "—"}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-muted-foreground w-20">Email</span>
            <span>{dbUser.email}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-muted-foreground w-20">Role</span>
            <span className="capitalize">{dbUser.role.toLowerCase()}</span>
          </div>
        </div>
      </section>

      {/* API Key */}
      <section className="rounded-lg border bg-card p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Key className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold">API Key</h2>
        </div>

        {dbUser.apiKey ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Use this key to authenticate write requests to the REST API.
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-muted rounded px-3 py-2 text-xs font-mono break-all">
                {dbUser.apiKey}
              </code>
            </div>
            <p className="text-xs text-muted-foreground">
              Pass as{" "}
              <code className="bg-muted px-1 rounded text-xs">
                Authorization: Bearer &lt;key&gt;
              </code>{" "}
              on all write requests.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Generate an API key to access the Pool Products DB REST API
              programmatically.
            </p>
            <form action={generateApiKey}>
              <Button type="submit" size="sm" variant="outline">
                Generate API Key
              </Button>
            </form>
          </div>
        )}
      </section>

      {/* Contributions */}
      <section className="rounded-lg border bg-card p-5">
        <h2 className="font-semibold mb-3">My Contributions</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Submit edits or add new products to help grow the database.
        </p>
        <div className="flex gap-2">
          <ButtonLink href="/products/new" size="sm" variant="outline">
            Add a Product
          </ButtonLink>
          <ButtonLink href="/products" size="sm" variant="outline">
            Browse to Suggest Edit
          </ButtonLink>
        </div>
      </section>
    </div>
  );
}
