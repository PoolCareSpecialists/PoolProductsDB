import { prisma } from "@/lib/prisma";
import { ButtonLink } from "@/components/ui/button-link";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ClipboardList } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Pending Edits" };

type TabValue = "pending" | "approved" | "rejected";

function isTabValue(v: string | undefined): v is TabValue {
  return v === "pending" || v === "approved" || v === "rejected";
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function countFields(fieldChanges: unknown): number {
  if (!fieldChanges || typeof fieldChanges !== "object") return 0;
  const fc = fieldChanges as Record<string, unknown>;
  if (fc.type === "product_edit") {
    const changes = fc.changes;
    if (changes && typeof changes === "object") {
      return Object.keys(changes).length;
    }
    return 0;
  }
  if (fc.type === "new_product") {
    const data = fc.data;
    if (data && typeof data === "object") {
      return Object.values(data as Record<string, unknown>).filter(
        (v) => v !== null && v !== "" && !(Array.isArray(v) && v.length === 0)
      ).length;
    }
    return 0;
  }
  return 0;
}

export default async function PendingEditsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const activeTab: TabValue = isTabValue(tab) ? tab : "pending";
  const statusMap = {
    pending: "PENDING",
    approved: "APPROVED",
    rejected: "REJECTED",
  } as const;

  const [pendingCount, approvedCount, rejectedCount, edits] = await Promise.all([
    prisma.pendingEdit.count({ where: { status: "PENDING" } }),
    prisma.pendingEdit.count({ where: { status: "APPROVED" } }),
    prisma.pendingEdit.count({ where: { status: "REJECTED" } }),
    prisma.pendingEdit.findMany({
      where: { status: statusMap[activeTab] },
      include: {
        product: { select: { id: true, name: true } },
        submittedBy: { select: { email: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const tabs: { label: string; value: TabValue; count: number }[] = [
    { label: "Pending", value: "pending", count: pendingCount },
    { label: "Approved", value: "approved", count: approvedCount },
    { label: "Rejected", value: "rejected", count: rejectedCount },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6 flex items-center gap-3">
        <ButtonLink variant="ghost" size="sm" href="/admin">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Admin
        </ButtonLink>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">Pending Edits</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Review and approve community-submitted product edits.
        </p>
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 border-b mb-6">
        {tabs.map((t) => (
          <Link
            key={t.value}
            href={`/admin/pending-edits?tab=${t.value}`}
            className={`px-4 py-2 text-sm font-medium flex items-center gap-2 border-b-2 -mb-px transition-colors ${
              activeTab === t.value
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
            <Badge variant="secondary" className="text-xs px-1.5 py-0">
              {t.count}
            </Badge>
          </Link>
        ))}
      </div>

      {edits.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-3 text-muted-foreground">
          <ClipboardList className="h-12 w-12 opacity-30" />
          <p className="font-medium">No {activeTab} edits</p>
          <p className="text-sm">
            {activeTab === "pending"
              ? "No submissions are waiting for review."
              : `No edits have been ${activeTab} yet.`}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Product</th>
                <th className="text-left px-4 py-3 font-medium">Submitted By</th>
                <th className="text-left px-4 py-3 font-medium">Date</th>
                <th className="text-left px-4 py-3 font-medium">Fields</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {edits.map((edit) => (
                <tr
                  key={edit.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/pending-edits/${edit.id}`}
                      className="font-medium hover:underline text-foreground"
                    >
                      {edit.product?.name ?? "New Product Request"}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {edit.submittedBy?.name || edit.submittedBy?.email || "Unknown"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(edit.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary" className="text-xs">
                      {countFields(edit.fieldChanges)} fields
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
