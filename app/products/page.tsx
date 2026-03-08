import { Suspense } from "react";
import { SearchResults } from "@/components/products/search-results";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Browse Products",
  description: "Browse all swimming pool products in the database.",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; brand?: string; page?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {params.category
            ? `Category: ${params.category.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}`
            : "All Products"}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          The complete swimming pool industry product catalog.
        </p>
      </div>

      <Suspense fallback={<BrowseSkeleton />}>
        <SearchResults
          query=""
          category={params.category}
          page={parseInt(params.page ?? "1")}
        />
      </Suspense>
    </div>
  );
}

function BrowseSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="rounded-lg border p-4 space-y-3">
          <Skeleton className="h-40 w-full rounded-md" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}
