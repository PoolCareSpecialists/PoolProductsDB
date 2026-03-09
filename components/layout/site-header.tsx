"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth, useUser, SignInButton, UserButton } from "@clerk/nextjs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { BarcodeScanButton } from "@/components/ui/barcode-scanner";
import { Search } from "lucide-react";

export function SiteHeader() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();

  // Check admin role from Clerk publicMetadata
  const isAdmin =
    (user?.publicMetadata as { role?: string } | undefined)?.role === "admin";

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <header className="border-b bg-background sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
            P
          </div>
          <span className="font-semibold text-lg hidden sm:block">
            Pool Products DB
          </span>
        </Link>

        <form onSubmit={handleSearch} className="flex-1 flex gap-2 max-w-xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="header-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, model number, or UPC…"
              className="pl-9"
            />
          </div>
          <BarcodeScanButton className="inline-flex items-center justify-center rounded-md border border-input bg-background px-2.5 h-8 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors" />
          <Button type="submit" size="sm">
            Search
          </Button>
        </form>

        <nav className="hidden md:flex items-center gap-1 ml-auto shrink-0">
          <ButtonLink variant="ghost" size="sm" href="/products">
            Browse
          </ButtonLink>
          {isLoaded && isSignedIn && isAdmin && (
            <ButtonLink variant="ghost" size="sm" href="/admin">
              Admin
            </ButtonLink>
          )}
          {isLoaded && !isSignedIn && (
            <SignInButton mode="modal">
              <Button size="sm">Sign In</Button>
            </SignInButton>
          )}
          {isLoaded && isSignedIn && (
            <UserButton
              appearance={{ elements: { avatarBox: "w-8 h-8" } }}
              userProfileUrl="/account"
            />
          )}
        </nav>
      </div>
    </header>
  );
}
