"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

type FilterProps = {
  categories: { id: string; name: string; slug: string }[];
  manufacturers: { id: string; name: string }[];
};

export function SearchFilters({ categories, manufacturers }: FilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get("category") ?? "";
  const currentManufacturer = searchParams.get("manufacturer") ?? "";
  const currentStatus = searchParams.get("status") ?? "";

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      // Reset to page 1 when filters change
      params.delete("page");
      router.push(`/search?${params.toString()}`);
    },
    [router, searchParams]
  );

  const clearAll = useCallback(() => {
    const params = new URLSearchParams();
    const q = searchParams.get("q");
    if (q) params.set("q", q);
    router.push(`/search?${params.toString()}`);
  }, [router, searchParams]);

  const hasFilters = currentCategory || currentManufacturer || currentStatus;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      {/* Category */}
      <select
        value={currentCategory}
        onChange={(e) => updateParam("category", e.target.value)}
        className="rounded-md border bg-background px-3 py-1.5 text-sm h-8"
      >
        <option value="">All Categories</option>
        {categories.map((c) => (
          <option key={c.id} value={c.slug}>
            {c.name}
          </option>
        ))}
      </select>

      {/* Manufacturer */}
      <select
        value={currentManufacturer}
        onChange={(e) => updateParam("manufacturer", e.target.value)}
        className="rounded-md border bg-background px-3 py-1.5 text-sm h-8"
      >
        <option value="">All Manufacturers</option>
        {manufacturers.map((m) => (
          <option key={m.id} value={m.name}>
            {m.name}
          </option>
        ))}
      </select>

      {/* Status */}
      <select
        value={currentStatus}
        onChange={(e) => updateParam("status", e.target.value)}
        className="rounded-md border bg-background px-3 py-1.5 text-sm h-8"
      >
        <option value="">Any Status</option>
        <option value="ACTIVE">Active</option>
        <option value="DISCONTINUED">Discontinued</option>
      </select>

      {/* Clear all */}
      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAll}
          className="h-8 text-xs"
        >
          <X className="h-3 w-3 mr-1" />
          Clear filters
        </Button>
      )}
    </div>
  );
}
