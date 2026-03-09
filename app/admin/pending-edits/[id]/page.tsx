import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ButtonLink } from "@/components/ui/button-link";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { approveEdit, rejectEdit } from "./actions";

export const metadata = { title: "Review Edit" };

function formatDate(date: Date) {
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
    APPROVED: "bg-green-100 text-green-800 border-green-200",
    REJECTED: "bg-red-100 text-red-800 border-red-200",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
        styles[status] ?? "bg-muted text-muted-foreground"
      }`}
    >
      {status}
    </span>
  );
}

type FieldChanges = Record<string, unknown>;

function ProductEditView({ fieldChanges }: { fieldChanges: FieldChanges }) {
  const changes = (fieldChanges.changes ?? {}) as Record<
    string,
    { from: string | null; to: string }
  >;
  const specNotes = fieldChanges.specNotes as string | null;
  const source = fieldChanges.source as string | null;

  return (
    <div className="space-y-4">
      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground w-1/4">Field</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground w-5/12">Current Value</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground w-5/12">Proposed Value</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {Object.entries(changes).map(([field, change]) => (
              <tr key={field}>
                <td className="px-4 py-3 font-medium capitalize">
                  {field.replace(/([A-Z])/g, " $1").trim()}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {change.from ?? <span className="italic text-muted-foreground/60">None</span>}
                </td>
                <td className="px-4 py-3 text-green-700 font-medium">{change.to}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {specNotes && (
        <div className="rounded-lg border bg-card p-4 space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Spec Notes
          </p>
          <p className="text-sm whitespace-pre-wrap">{specNotes}</p>
        </div>
      )}

      {source && (
        <div className="rounded-lg border bg-card p-4 space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Source</p>
          <p className="text-sm whitespace-pre-wrap">{source}</p>
        </div>
      )}
    </div>
  );
}

function NewProductView({ fieldChanges }: { fieldChanges: FieldChanges }) {
  const data = (fieldChanges.data ?? {}) as Record<string, unknown>;
  const specs = (data.specs ?? []) as { specKey: string; specValue: string; unit?: string }[];
  const maintenance = (data.maintenance ?? []) as {
    taskName: string;
    intervalValue: string;
    intervalUnit: string;
    notes?: string;
  }[];
  const documents = (data.documents ?? []) as {
    type: string;
    title: string;
    externalUrl: string;
  }[];

  function Row({ label, value }: { label: string; value: unknown }) {
    if (!value && value !== 0) return null;
    return (
      <div className="flex gap-3 py-2 border-b last:border-b-0">
        <span className="text-muted-foreground w-36 shrink-0 text-sm">{label}</span>
        <span className="text-sm">{String(value)}</span>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-lg border bg-card p-5">
        <h3 className="font-semibold text-sm mb-3">Product Info</h3>
        <Row label="Manufacturer" value={data.manufacturerName} />
        <Row label="Brand" value={data.brandName} />
        <Row label="Name" value={data.name} />
        <Row label="Model Number" value={data.modelNumber} />
        <Row label="UPC" value={data.upc} />
        <Row label="SKU" value={data.sku} />
        <Row label="Status" value={data.status} />
        <Row label="Category ID" value={data.categoryId} />
        {typeof data.description === "string" && data.description && (
          <div className="flex gap-3 py-2">
            <span className="text-muted-foreground w-36 shrink-0 text-sm">Description</span>
            <span className="text-sm whitespace-pre-wrap">{data.description}</span>
          </div>
        )}
      </div>

      {specs.length > 0 && (
        <div className="rounded-lg border bg-card p-5">
          <h3 className="font-semibold text-sm mb-3">
            Specifications ({specs.length})
          </h3>
          <div className="space-y-1">
            {specs.map((s, i) => (
              <div key={i} className="flex gap-2 text-sm py-1 border-b last:border-b-0">
                <span className="font-medium w-40 shrink-0">{s.specKey}</span>
                <span>
                  {s.specValue}
                  {s.unit ? ` ${s.unit}` : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {maintenance.length > 0 && (
        <div className="rounded-lg border bg-card p-5">
          <h3 className="font-semibold text-sm mb-3">
            Maintenance Schedule ({maintenance.length})
          </h3>
          <div className="space-y-2">
            {maintenance.map((m, i) => (
              <div key={i} className="text-sm py-2 border-b last:border-b-0">
                <span className="font-medium">{m.taskName}</span>
                <span className="text-muted-foreground ml-2">
                  — Every {m.intervalValue} {m.intervalUnit}
                </span>
                {m.notes && (
                  <p className="text-muted-foreground mt-0.5 text-xs">{m.notes}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {documents.length > 0 && (
        <div className="rounded-lg border bg-card p-5">
          <h3 className="font-semibold text-sm mb-3">Documents ({documents.length})</h3>
          <div className="space-y-2">
            {documents.map((d, i) => (
              <div
                key={i}
                className="text-sm py-2 border-b last:border-b-0 flex items-center gap-3"
              >
                <Badge variant="secondary" className="text-xs shrink-0">
                  {d.type.replace(/_/g, " ")}
                </Badge>
                <span className="font-medium">{d.title}</span>
                <a
                  href={d.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-xs truncate"
                >
                  {d.externalUrl}
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default async function PendingEditDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const edit = await prisma.pendingEdit.findUnique({
    where: { id },
    include: {
      product: { select: { id: true, name: true } },
      submittedBy: { select: { id: true, email: true, name: true } },
      reviewedBy: { select: { id: true, email: true, name: true } },
    },
  });

  if (!edit) notFound();

  const fieldChanges = edit.fieldChanges as FieldChanges;
  const editType = fieldChanges.type as string;
  const isNewProduct = editType === "new_product";
  const isReviewed = edit.status !== "PENDING";

  const title = isNewProduct ? "New Product Request" : (edit.product?.name ?? "Product Edit");

  const approveWithId = approveEdit.bind(null, edit.id);
  const rejectWithId = rejectEdit.bind(null, edit.id);

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-6">
        <ButtonLink variant="ghost" size="sm" href="/admin/pending-edits">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Pending Edits
        </ButtonLink>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Submitted by{" "}
            <span className="font-medium text-foreground">
              {edit.submittedBy?.name || edit.submittedBy?.email || "Unknown"}
            </span>{" "}
            on {formatDate(edit.createdAt)}
          </p>
        </div>
        <StatusBadge status={edit.status} />
      </div>

      {/* Data view */}
      {isNewProduct ? (
        <NewProductView fieldChanges={fieldChanges} />
      ) : (
        <ProductEditView fieldChanges={fieldChanges} />
      )}

      {/* Already reviewed info */}
      {isReviewed && (
        <div className="mt-6 rounded-lg border bg-muted/30 p-4 space-y-1 text-sm">
          <p className="font-medium">
            {edit.status === "APPROVED" ? "Approved" : "Rejected"} by{" "}
            {(edit.reviewedBy?.name || edit.reviewedBy?.email) ?? "Unknown"} on{" "}
            {edit.reviewedAt ? formatDate(edit.reviewedAt) : "—"}
          </p>
          {edit.reviewNotes && (
            <p className="text-muted-foreground">{edit.reviewNotes}</p>
          )}
        </div>
      )}

      {/* Admin action forms — only shown for PENDING edits */}
      {!isReviewed && (
        <div className="mt-8 rounded-lg border bg-card p-5 space-y-5">
          <h2 className="font-semibold">Admin Review</h2>

          {/* Approve */}
          <form action={approveWithId} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="reviewNotesApprove" className="text-sm font-medium">
                Admin Notes (optional)
              </label>
              <textarea
                id="reviewNotesApprove"
                name="reviewNotes"
                placeholder="Notes visible to the submitter…"
                rows={3}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Approve
            </button>
          </form>

          <div className="border-t pt-4">
            <form action={rejectWithId} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="reviewNotesReject" className="text-sm font-medium text-muted-foreground">
                  Rejection reason (optional)
                </label>
                <textarea
                  id="reviewNotesReject"
                  name="reviewNotes"
                  placeholder="Explain why this submission is being rejected…"
                  rows={2}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-md border border-red-300 bg-background px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Reject
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
