"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export function SiteHeader() {
  const router = useRouter();
  const [query, setQuery] = useState("");

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
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, model number, or UPC…"
              className="pl-9"
            />
          </div>
          <Button type="submit" size="sm">
            Search
          </Button>
        </form>

        <nav className="hidden md:flex items-center gap-1 ml-auto shrink-0">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/products">Browse</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin">Admin</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/account">Sign In</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
