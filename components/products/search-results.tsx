import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, PackageX } from "lucide-react";

const PAGE_SIZE = 24;

type SearchResultsProps = {
  query: string;
  category?: string;
  page: number;
};

export async function SearchResults({ query, category, page }: SearchResultsProps) {
  const skip = (page - 1) * PAGE_SIZE;

  const where: Prisma.ProductWhereInput = {
    ...(query && {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { modelNumber: { contains: query, mode: "insensitive" } },
        { upc: { contains: query } },
        { sku: { contains: query, mode: "insensitive" } },
        { brand: { name: { contains: query, mode: "insensitive" } } },
        { brand: { manufacturer: { name: { contains: query, mode: "insensitive" } } } },
      ],
    }),
    ...(category && { category: { slug: category } }),
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        brand: { include: { manufacturer: true } },
        category: true,
        images: { where: { isPrimary: true }, take: 1 },
      },
      orderBy: { name: "asc" },
      skip,
      take: PAGE_SIZE,
    }),
    prisma.product.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
        <PackageX className="h-12 w-12 text-muted-foreground/40" />
        <p className="text-lg font-medium">No products found</p>
        <p className="text-muted-foreground text-sm">
          {query
            ? `No results for "${query}". Try a different search term.`
            : "No products in this category yet."}
        </p>
        <Button variant="outline" asChild>
          <Link href="/products/new">Add a product</Link>
        </Button>
      </div>
    );
  }

  function buildPageUrl(p: number) {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (category) params.set("category", category);
    if (p > 1) params.set("page", String(p));
    return `/search?${params.toString()}`;
  }

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-4">
        {total.toLocaleString()} product{total !== 1 ? "s" : ""} found
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className="rounded-lg border bg-card hover:border-blue-400 hover:shadow-sm transition-all group flex flex-col overflow-hidden"
          >
            <div className="bg-muted/50 h-40 flex items-center justify-center">
              {product.images[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.images[0].url}
                  alt={product.images[0].altText ?? product.name}
                  className="h-full w-full object-contain p-2"
                />
              ) : (
                <div className="text-4xl text-muted-foreground/20 font-bold select-none">
                  {product.name[0]}
                </div>
              )}
            </div>
            <div className="p-4 flex flex-col gap-1 flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium text-sm leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
                  {product.name}
                </p>
                {product.status === "DISCONTINUED" && (
                  <Badge variant="secondary" className="shrink-0 text-xs">
                    Discontinued
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {product.brand.manufacturer.name} · {product.brand.name}
              </p>
              {product.modelNumber && (
                <p className="text-xs text-muted-foreground font-mono">
                  {product.modelNumber}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-auto pt-1">
                {product.category.name}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} asChild={page > 1}>
            {page > 1 ? (
              <Link href={buildPageUrl(page - 1)}>
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Link>
            ) : (
              <span>
                <ChevronLeft className="h-4 w-4" />
                Previous
              </span>
            )}
          </Button>
          <span className="text-sm text-muted-foreground px-2">
            Page {page} of {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} asChild={page < totalPages}>
            {page < totalPages ? (
              <Link href={buildPageUrl(page + 1)}>
                Next
                <ChevronRight className="h-4 w-4" />
              </Link>
            ) : (
              <span>
                Next
                <ChevronRight className="h-4 w-4" />
              </span>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
