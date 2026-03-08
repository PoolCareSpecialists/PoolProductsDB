import Link from "next/link";
import { ButtonLink } from "@/components/ui/button-link";
import { ArrowLeft, Plus } from "lucide-react";

export const metadata = { title: "Add Product" };

export default function NewProductPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <ButtonLink variant="ghost" size="sm" href="/products">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Products
        </ButtonLink>
      </div>

      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
          <Plus className="h-5 w-5 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold">Add a Product</h1>
      </div>
      <p className="text-muted-foreground mb-8">
        Submit a new pool product for inclusion in the database. An admin will review your submission before it goes live.
      </p>

      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800 mb-6">
        <strong>Sign-in required.</strong> You&apos;ll need an account to submit products.{" "}
        <Link href="/account" className="underline font-medium">Sign in here.</Link>
      </div>

      <div className="rounded-lg border bg-card p-6 space-y-4 text-muted-foreground text-sm">
        <p className="font-medium text-foreground">Coming soon — the product submission form will include:</p>
        <ul className="space-y-1 list-disc list-inside">
          <li>Manufacturer &amp; brand selection</li>
          <li>Product name, model number, UPC/SKU</li>
          <li>Category assignment</li>
          <li>Technical specifications</li>
          <li>Maintenance schedule</li>
          <li>Document uploads (manuals, spec sheets)</li>
          <li>Product images</li>
        </ul>
      </div>
    </div>
  );
}
