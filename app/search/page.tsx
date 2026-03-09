import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { SearchResults } from "@/components/products/search-results";
import { SearchFilters } from "@/components/products/search-filters";
import { Skeleton } from "@/components/ui/skeleton";

export function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  return searchParams.then(({ q }) => ({
    title: q ? `Search: ${q}` : "Search Products",
  }));
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    category?: string;
    manufacturer?: string;
    status?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;

  // Fetch filter options
  const [categories, manufacturers] = await Promise.all([
    prisma.category.findMany({
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    }),
    prisma.manufacturer.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {params.q ? (
            <>
              Results for <span className="text-blue-600">&quot;{params.q}&quot;</span>
            </>
          ) : (
            "Browse All Products"
          )}
        </h1>
      </div>

      <SearchFilters categories={categories} manufacturers={manufacturers} />

      <Suspense fallback={<SearchSkeleton />}>
        <SearchResults
          query={params.q ?? ""}
          category={params.category}
          manufacturer={params.manufacturer}
          status={params.status}
          page={parseInt(params.page ?? "1")}
        />
      </Suspense>
    </div>
  );
}

function SearchSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-lg border p-4 space-y-3">
          <Skeleton className="h-40 w-full rounded-md" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}
