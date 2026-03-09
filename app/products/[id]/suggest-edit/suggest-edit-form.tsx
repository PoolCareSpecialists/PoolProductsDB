"use client";

import { useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { submitSuggestEdit } from "./actions";
import type { Product, ProductSpec, MaintenanceSchedule } from "@prisma/client";

type ProductWithDetails = Product & {
  specs: ProductSpec[];
  maintenanceSchedules: MaintenanceSchedule[];
};

export function SuggestEditForm({ product }: { product: ProductWithDetails }) {
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(() => submitSuggestEdit(product.id, formData));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Core fields */}
      <div className="rounded-lg border bg-card p-5 space-y-5">
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          Product Details
        </h2>

        <FieldRow
          label="Product Name"
          name="name"
          current={product.name}
          placeholder="Proposed name"
        />
        <FieldRow
          label="Model Number"
          name="modelNumber"
          current={product.modelNumber}
          placeholder="Proposed model number"
        />
        <FieldRow
          label="UPC"
          name="upc"
          current={product.upc}
          placeholder="Proposed UPC"
        />
        <FieldRow
          label="SKU"
          name="sku"
          current={product.sku}
          placeholder="Proposed SKU"
        />
        <FieldRow
          label="EAN"
          name="ean"
          current={product.ean}
          placeholder="Proposed EAN"
        />
        <FieldRow
          label="ASIN"
          name="asin"
          current={product.asin}
          placeholder="Proposed ASIN"
        />
      </div>

      {/* Pricing */}
      <div className="rounded-lg border bg-card p-5 space-y-5">
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          Pricing
        </h2>
        <FieldRow
          label="MSRP"
          name="msrp"
          current={product.msrp ? `$${Number(product.msrp).toFixed(2)}` : null}
          placeholder="e.g. 299.99"
        />
        <FieldRow
          label="MAP (Min Advertised Price)"
          name="map"
          current={product.map ? `$${Number(product.map).toFixed(2)}` : null}
          placeholder="e.g. 249.99"
        />
      </div>

      {/* Physical Details */}
      <div className="rounded-lg border bg-card p-5 space-y-5">
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          Physical Details
        </h2>
        <FieldRow
          label="Dimensions"
          name="dimensions"
          current={product.dimensions}
          placeholder='e.g. 24" x 12" x 18"'
        />
        <FieldRow
          label="Weight"
          name="weight"
          current={product.weight}
          placeholder="e.g. 45 lbs"
        />
        <FieldRow
          label="Country of Origin"
          name="countryOfOrigin"
          current={product.countryOfOrigin}
          placeholder="e.g. USA"
        />
        <FieldRow
          label="Warranty (years)"
          name="warrantyYears"
          current={product.warrantyYears?.toString() ?? null}
          placeholder="e.g. 3"
        />
        <FieldRow
          label="Release Date"
          name="releaseDate"
          current={
            product.releaseDate
              ? new Date(product.releaseDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                })
              : null
          }
          placeholder="YYYY-MM (e.g. 2024-06)"
        />
      </div>

      {/* Features */}
      <div className="rounded-lg border bg-card p-5 space-y-4">
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          Features
        </h2>
        {product.features.length > 0 && (
          <div className="text-xs text-muted-foreground bg-muted/40 rounded p-3 space-y-1">
            <p className="font-medium text-foreground mb-1">Current features:</p>
            {product.features.map((f, i) => (
              <p key={i}>• {f}</p>
            ))}
          </div>
        )}
        <Textarea
          name="features"
          placeholder={"Enter proposed features, one per line:\ne.g. Variable speed motor\nEnergy Star certified\nSelf-priming design"}
          className="min-h-[80px] text-sm"
        />
        <p className="text-xs text-muted-foreground">
          One feature per line. Leave blank to keep current features.
        </p>
      </div>

      {/* Certifications */}
      <div className="rounded-lg border bg-card p-5 space-y-4">
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          Certifications
        </h2>
        {product.certifications.length > 0 && (
          <div className="text-xs text-muted-foreground bg-muted/40 rounded p-3">
            <span className="font-medium text-foreground">Current: </span>
            {product.certifications.join(", ")}
          </div>
        )}
        <Input
          name="certifications"
          placeholder="Comma-separated, e.g. NSF/ANSI 50, UL Listed, Energy Star"
          className="text-sm"
        />
        <p className="text-xs text-muted-foreground">
          Leave blank to keep current certifications.
        </p>
      </div>

      {/* Product Details (continued) — Description */}
      <div className="rounded-lg border bg-card p-5 space-y-5">
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          Description
        </h2>

        {/* Description */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Description</Label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Current</p>
              <div className="rounded-md border bg-muted/50 px-3 py-2 text-sm text-muted-foreground min-h-[80px] whitespace-pre-wrap">
                {product.description ?? (
                  <span className="italic">None</span>
                )}
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Proposed</p>
              <Textarea
                name="description"
                placeholder="Proposed description"
                className="min-h-[80px] text-sm"
              />
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Status</Label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Current</p>
              <div className="rounded-md border bg-muted/50 px-3 py-2 text-sm text-muted-foreground capitalize">
                {product.status.toLowerCase()}
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Proposed</p>
              <select
                name="status"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                defaultValue=""
              >
                <option value="">No change</option>
                <option value="ACTIVE">Active</option>
                <option value="DISCONTINUED">Discontinued</option>
                <option value="UNKNOWN">Unknown</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Specs & Maintenance notes */}
      <div className="rounded-lg border bg-card p-5 space-y-4">
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          Specs & Maintenance Changes
        </h2>
        <p className="text-xs text-muted-foreground">
          Describe any changes to specifications or maintenance schedules. The
          admin will apply them after review.
        </p>

        {product.specs.length > 0 && (
          <div className="text-xs text-muted-foreground bg-muted/40 rounded p-3 space-y-1">
            <p className="font-medium text-foreground mb-1">Current specs:</p>
            {product.specs.map((s) => (
              <p key={s.id}>
                {s.specKey}: {s.specValue}
                {s.unit ? ` ${s.unit}` : ""}
              </p>
            ))}
          </div>
        )}

        <Textarea
          name="specNotes"
          placeholder={
            "e.g. Max Flow Rate should be 125 GPM not 120 GPM\nAdd spec: Warranty — 3 years"
          }
          className="min-h-[100px] text-sm"
        />
      </div>

      {/* Source */}
      <div className="rounded-lg border bg-card p-5 space-y-3">
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          Source / Notes
        </h2>
        <p className="text-xs text-muted-foreground">
          Where did you find this information? A URL, manual page number, or
          personal experience helps the admin verify your edit.
        </p>
        <Textarea
          name="source"
          placeholder="e.g. https://manufacturer.com/spec-sheet or 'from the product manual page 12'"
          className="min-h-[60px] text-sm"
        />
      </div>

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Submitting…" : "Submit for Review"}
      </Button>
    </form>
  );
}

function FieldRow({
  label,
  name,
  current,
  placeholder,
}: {
  label: string;
  name: string;
  current: string | null | undefined;
  placeholder: string;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Current</p>
          <div className="rounded-md border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
            {current ?? <span className="italic">None</span>}
          </div>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Proposed</p>
          <Input name={name} placeholder={placeholder} className="text-sm" />
        </div>
      </div>
    </div>
  );
}
