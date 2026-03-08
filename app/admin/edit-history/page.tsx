import { prisma } from "@/lib/prisma";
import { ButtonLink } from "@/components/ui/button-link";
import { ArrowLeft, History } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Edit History" };

const PAGE_SIZE = 25;

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function countChangedFields(fieldChanges: unknown): number {
  if (!fieldChanges || typeof fieldChanges !== "object") return 0;
  const fc = fieldChanges as Record<string, unknown>;
  if (fc.type === "product_edit") {
    const changes = fc.changes;
    if (changes && typeof changes === "object") {
      return Object.keys(changes as object).length;
    }
    return 0;
  }
  if (fc.type === "new_product_approved" || fc.type === "new_product") {
    return 1; // Represents a full product creation
  }
  // Generic fallback — count top-level keys minus "type"
  return Math.max(0, Object.keys(fc).length - 1);
}

function editSummary(fieldChanges: unknown): string {
  if (!fieldChanges || typeof fieldChanges !== "object") return "—";
  const fc = fieldChanges as Record<string, unknown>;
  if (fc.type === "new_product_approved") return "New product created";
  if (fc.type === "product_edit") {
    const changes = fc.changes;
    if (changes && typeof changes === "object") {
      const fields = Object.keys(changes as object);
      if (fields.length === 1) return `Updated ${fields[0]}`;
      if (fields.length <= 3) return `Updated ${fields.join(", ")}`;
      return `Updated ${fields.length} fields`;
    }
  }
  return "Change recorded";
}

export default async function EditHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1"));
  const skip = (page - 1) * PAGE_SIZE;

  const [total, records] = await Promise.all([
    prisma.editHistory.count(),
    prisma.editHistory.findMany({
      skip,
      take: PAGE_SIZE,
      orderBy: { changedAt: "desc" },
      include: {
        product: { select: { id: true, name: true } },
        changedBy: { select: { id: true, email: true, name: true } },
      },
    }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <ButtonLink variant="ghost" size="sm" href="/admin">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Admin
        </ButtonLink>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">Edit History</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Full audit log of all approved changes to the product database.
        </p>
      </div>

      {records.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-3 text-muted-foreground">
          <History className="h-12 w-12 opacity-30" />
          <p className="font-medium">No edit history yet</p>
          <p className="text-sm">
            Approved edits and new product creations will appear here.
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Product</th>
                  <th className="text-left px-4 py-3 font-medium">Changed By</th>
                  <th className="text-left px-4 py-3 font-medium">Date</th>
                  <th className="text-left px-4 py-3 font-medium">Summary</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {records.map((record) => (
                  <tr key={record.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        href={`/products/${record.product.id}`}
                        className="font-medium hover:underline text-foreground"
                      >
                        {record.product.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {record.changedBy.name || record.changedBy.email}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {formatDate(record.changedAt)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {editSummary(record.fieldChanges)}
                      {countChangedFields(record.fieldChanges) > 0 && (
                        <span className="ml-1 text-xs">
                          ({countChangedFields(record.fieldChanges)}{" "}
                          {countChangedFields(record.fieldChanges) === 1 ? "field" : "fields"})
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
              <p>
                Showing {skip + 1}–{Math.min(skip + PAGE_SIZE, total)} of {total} records
              </p>
              <div className="flex gap-2">
                {hasPrev ? (
                  <ButtonLink
                    href={`/admin/edit-history?page=${page - 1}`}
                    variant="outline"
                    size="sm"
                  >
                    Previous
                  </ButtonLink>
                ) : (
                  <button
                    disabled
                    className="inline-flex items-center justify-center rounded-md border px-3 py-1.5 text-sm font-medium opacity-50 cursor-not-allowed"
                  >
                    Previous
                  </button>
                )}
                {hasNext ? (
                  <ButtonLink
                    href={`/admin/edit-history?page=${page + 1}`}
                    variant="outline"
                    size="sm"
                  >
                    Next
                  </ButtonLink>
                ) : (
                  <button
                    disabled
                    className="inline-flex items-center justify-center rounded-md border px-3 py-1.5 text-sm font-medium opacity-50 cursor-not-allowed"
                  >
                    Next
                  </button>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
