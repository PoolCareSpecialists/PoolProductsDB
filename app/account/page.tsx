import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LogIn, KeyRound, User } from "lucide-react";

export const metadata = { title: "Account" };

export default function AccountPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-md text-center">
      <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-6">
        <User className="h-8 w-8 text-blue-600" />
      </div>
      <h1 className="text-2xl font-bold mb-2">Sign In</h1>
      <p className="text-muted-foreground mb-8">
        Sign in to contribute to the database, submit edits, and manage your API keys.
      </p>

      <div className="rounded-lg border bg-card p-6 text-left space-y-4 mb-6">
        <div className="flex items-start gap-3">
          <LogIn className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-sm">Contributor account</p>
            <p className="text-xs text-muted-foreground">
              Submit edits and new products for admin review.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <KeyRound className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-sm">API key access</p>
            <p className="text-xs text-muted-foreground">
              Generate API keys to integrate pool product data into your own apps.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
        <strong>Authentication coming soon.</strong> We&apos;re setting up sign-in — check back shortly.
      </div>

      <Button className="mt-6 w-full" disabled>
        Sign In (Coming Soon)
      </Button>

      <p className="text-xs text-muted-foreground mt-4">
        Questions?{" "}
        <Link href="/about" className="underline hover:text-foreground">
          Learn more about contributing
        </Link>
      </p>
    </div>
  );
}
