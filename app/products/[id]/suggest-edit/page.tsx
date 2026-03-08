import Link from "next/link";
import { ButtonLink } from "@/components/ui/button-link";
import { ArrowLeft, Pencil } from "lucide-react";

export const metadata = { title: "Suggest Edit" };

export default async function SuggestEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <ButtonLink variant="ghost" size="sm" href={`/products/${id}`}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Product
        </ButtonLink>
      </div>

      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
          <Pencil className="h-5 w-5 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold">Suggest an Edit</h1>
      </div>
      <p className="text-muted-foreground mb-8">
        Found incorrect or missing information? Submit a correction and an admin will review it before it goes live.
      </p>

      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800 mb-6">
        <strong>Sign-in required.</strong> You&apos;ll need an account to submit edits.{" "}
        <Link href="/account" className="underline font-medium">Sign in here.</Link>
      </div>

      <div className="rounded-lg border bg-card p-6 space-y-4 text-muted-foreground text-sm">
        <p className="font-medium text-foreground">Coming soon — the edit form will let you update:</p>
        <ul className="space-y-1 list-disc list-inside">
          <li>Product name, model number, UPC, SKU</li>
          <li>Technical specifications</li>
          <li>Maintenance schedule</li>
          <li>Compatible parts and chemicals</li>
          <li>Documents and images</li>
        </ul>
        <p>
          Each field will show the current value alongside your proposed change, and you can provide a source or notes to help the admin verify it.
        </p>
      </div>
    </div>
  );
}
