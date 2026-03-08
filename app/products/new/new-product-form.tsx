"use client";

import { useTransition, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { submitNewProduct } from "./actions";
import { Plus, Trash2 } from "lucide-react";

type Manufacturer = { id: string; name: string };
type Category = { id: string; name: string; slug: string; parentId: string | null };

type SpecRow = { specKey: string; specValue: string; unit: string };
type MaintenanceRow = { taskName: string; intervalValue: string; intervalUnit: string; notes: string };
type DocumentRow = { type: string; title: string; externalUrl: string };

function emptySpecs(): SpecRow[] {
  return [
    { specKey: "", specValue: "", unit: "" },
    { specKey: "", specValue: "", unit: "" },
    { specKey: "", specValue: "", unit: "" },
  ];
}

export function NewProductForm({
  manufacturers,
  categories,
}: {
  manufacturers: Manufacturer[];
  categories: Category[];
}) {
  const [pending, startTransition] = useTransition();

  // Manufacturer & Brand
  const [selectedManufacturerId, setSelectedManufacturerId] = useState<string>("");
  const [newManufacturerName, setNewManufacturerName] = useState("");
  const [selectedBrandId, setSelectedBrandId] = useState<string>("");
  const [newBrandName, setNewBrandName] = useState("");
  const [brands, setBrands] = useState<{ id: string; name: string }[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(false);

  // Dynamic rows
  const [specs, setSpecs] = useState<SpecRow[]>(emptySpecs());
  const [maintenance, setMaintenance] = useState<MaintenanceRow[]>([]);
  const [documents, setDocuments] = useState<DocumentRow[]>([]);

  // Fetch brands when manufacturer changes
  useEffect(() => {
    if (!selectedManufacturerId) {
      setBrands([]);
      setSelectedBrandId("");
      return;
    }
    setLoadingBrands(true);
    fetch(`/api/v1/brands?manufacturerId=${selectedManufacturerId}`)
      .then((r) => r.json())
      .then((data) => {
        setBrands(Array.isArray(data) ? data : []);
        setSelectedBrandId("");
      })
      .catch(() => setBrands([]))
      .finally(() => setLoadingBrands(false));
  }, [selectedManufacturerId]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    // Determine manufacturer name
    const manufacturerName =
      newManufacturerName.trim() ||
      manufacturers.find((m) => m.id === selectedManufacturerId)?.name ||
      "";

    // Determine brand name
    const brandName =
      newBrandName.trim() ||
      brands.find((b) => b.id === selectedBrandId)?.name ||
      "";

    formData.set("manufacturerName", manufacturerName);
    formData.set("brandName", brandName);
    formData.set("specs", JSON.stringify(specs));
    formData.set("maintenance", JSON.stringify(maintenance));
    formData.set("documents", JSON.stringify(documents));

    startTransition(() => submitNewProduct(formData));
  }

  // ── Spec helpers ──
  function updateSpec(index: number, field: keyof SpecRow, value: string) {
    setSpecs((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  }
  function addSpec() {
    setSpecs((prev) => [...prev, { specKey: "", specValue: "", unit: "" }]);
  }
  function removeSpec(index: number) {
    setSpecs((prev) => prev.filter((_, i) => i !== index));
  }

  // ── Maintenance helpers ──
  function updateMaintenance(index: number, field: keyof MaintenanceRow, value: string) {
    setMaintenance((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  }
  function addMaintenance() {
    setMaintenance((prev) => [
      ...prev,
      { taskName: "", intervalValue: "", intervalUnit: "months", notes: "" },
    ]);
  }
  function removeMaintenance(index: number) {
    setMaintenance((prev) => prev.filter((_, i) => i !== index));
  }

  // ── Document helpers ──
  function updateDocument(index: number, field: keyof DocumentRow, value: string) {
    setDocuments((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  }
  function addDocument() {
    setDocuments((prev) => [...prev, { type: "MANUAL", title: "", externalUrl: "" }]);
  }
  function removeDocument(index: number) {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ── 1. Manufacturer & Brand ── */}
      <section className="rounded-lg border bg-card p-5 space-y-5">
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          Manufacturer &amp; Brand
        </h2>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Manufacturer</Label>
          <select
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            value={selectedManufacturerId}
            onChange={(e) => {
              setSelectedManufacturerId(e.target.value);
              setNewManufacturerName("");
            }}
          >
            <option value="">— Select existing manufacturer —</option>
            {manufacturers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground">Or enter a new manufacturer name:</p>
          <Input
            placeholder="New manufacturer name"
            value={newManufacturerName}
            onChange={(e) => {
              setNewManufacturerName(e.target.value);
              if (e.target.value.trim()) setSelectedManufacturerId("");
            }}
            className="text-sm"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Brand</Label>
          {selectedManufacturerId && (
            <>
              <select
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={selectedBrandId}
                onChange={(e) => {
                  setSelectedBrandId(e.target.value);
                  setNewBrandName("");
                }}
                disabled={loadingBrands}
              >
                <option value="">
                  {loadingBrands ? "Loading brands…" : "— Select existing brand —"}
                </option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">Or enter a new brand name:</p>
            </>
          )}
          <Input
            placeholder="New brand name"
            value={newBrandName}
            onChange={(e) => {
              setNewBrandName(e.target.value);
              if (e.target.value.trim()) setSelectedBrandId("");
            }}
            className="text-sm"
          />
        </div>
      </section>

      {/* ── 2. Basic Info ── */}
      <section className="rounded-lg border bg-card p-5 space-y-4">
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          Basic Info
        </h2>

        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium">
            Product Name <span className="text-destructive">*</span>
          </Label>
          <Input id="name" name="name" required placeholder="e.g. Hayward Super Pump" className="text-sm" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="modelNumber" className="text-sm font-medium">
              Model Number
            </Label>
            <Input id="modelNumber" name="modelNumber" placeholder="e.g. SP2610X15" className="text-sm" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="upc" className="text-sm font-medium">
              UPC
            </Label>
            <Input id="upc" name="upc" placeholder="12-digit barcode" className="text-sm" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sku" className="text-sm font-medium">
              SKU
            </Label>
            <Input id="sku" name="sku" placeholder="Internal SKU" className="text-sm" />
          </div>
        </div>
      </section>

      {/* ── 3. Category ── */}
      <section className="rounded-lg border bg-card p-5 space-y-3">
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          Category
        </h2>
        <div className="space-y-2">
          <Label htmlFor="categoryId" className="text-sm font-medium">
            Category
          </Label>
          <select
            id="categoryId"
            name="categoryId"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="">— Select a category —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.parentId ? `  ${c.name}` : c.name}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* ── 4. Status ── */}
      <section className="rounded-lg border bg-card p-5 space-y-3">
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          Status
        </h2>
        <div className="space-y-2">
          <Label htmlFor="status" className="text-sm font-medium">
            Product Status
          </Label>
          <select
            id="status"
            name="status"
            defaultValue="ACTIVE"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="ACTIVE">Active</option>
            <option value="DISCONTINUED">Discontinued</option>
            <option value="UNKNOWN">Unknown</option>
          </select>
        </div>
      </section>

      {/* ── 5. Description ── */}
      <section className="rounded-lg border bg-card p-5 space-y-3">
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          Description
        </h2>
        <Textarea
          name="description"
          placeholder="Brief product description…"
          className="min-h-[100px] text-sm"
        />
      </section>

      {/* ── 6. Specifications ── */}
      <section className="rounded-lg border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Specifications
          </h2>
          <Button type="button" variant="outline" size="sm" onClick={addSpec}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add Row
          </Button>
        </div>

        {specs.length === 0 && (
          <p className="text-sm text-muted-foreground">No specs added yet.</p>
        )}

        <div className="space-y-2">
          {specs.map((row, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_6rem_2rem] gap-2 items-center">
              <Input
                placeholder="Spec name (e.g. Max Flow Rate)"
                value={row.specKey}
                onChange={(e) => updateSpec(i, "specKey", e.target.value)}
                className="text-sm"
              />
              <Input
                placeholder="Value (e.g. 125)"
                value={row.specValue}
                onChange={(e) => updateSpec(i, "specValue", e.target.value)}
                className="text-sm"
              />
              <Input
                placeholder="Unit (GPM)"
                value={row.unit}
                onChange={(e) => updateSpec(i, "unit", e.target.value)}
                className="text-sm"
              />
              <button
                type="button"
                onClick={() => removeSpec(i)}
                className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                aria-label="Remove spec"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── 7. Maintenance Schedule ── */}
      <section className="rounded-lg border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Maintenance Schedule
          </h2>
          <Button type="button" variant="outline" size="sm" onClick={addMaintenance}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add Task
          </Button>
        </div>

        {maintenance.length === 0 && (
          <p className="text-sm text-muted-foreground">No maintenance tasks added yet.</p>
        )}

        <div className="space-y-3">
          {maintenance.map((row, i) => (
            <div key={i} className="grid grid-cols-[1fr_5rem_7rem_1fr_2rem] gap-2 items-start">
              <Input
                placeholder="Task name (e.g. Clean filter)"
                value={row.taskName}
                onChange={(e) => updateMaintenance(i, "taskName", e.target.value)}
                className="text-sm"
              />
              <Input
                type="number"
                min="1"
                placeholder="Every"
                value={row.intervalValue}
                onChange={(e) => updateMaintenance(i, "intervalValue", e.target.value)}
                className="text-sm"
              />
              <select
                className="rounded-md border bg-background px-3 py-2 text-sm h-9"
                value={row.intervalUnit}
                onChange={(e) => updateMaintenance(i, "intervalUnit", e.target.value)}
              >
                <option value="days">Days</option>
                <option value="weeks">Weeks</option>
                <option value="months">Months</option>
                <option value="years">Years</option>
              </select>
              <Input
                placeholder="Notes (optional)"
                value={row.notes}
                onChange={(e) => updateMaintenance(i, "notes", e.target.value)}
                className="text-sm"
              />
              <button
                type="button"
                onClick={() => removeMaintenance(i)}
                className="p-1 text-muted-foreground hover:text-destructive transition-colors mt-1"
                aria-label="Remove task"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── 8. Documents ── */}
      <section className="rounded-lg border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Documents
          </h2>
          <Button type="button" variant="outline" size="sm" onClick={addDocument}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add Document
          </Button>
        </div>

        {documents.length === 0 && (
          <p className="text-sm text-muted-foreground">No documents added yet.</p>
        )}

        <div className="space-y-3">
          {documents.map((row, i) => (
            <div key={i} className="grid grid-cols-[8rem_1fr_1fr_2rem] gap-2 items-start">
              <select
                className="rounded-md border bg-background px-3 py-2 text-sm h-9"
                value={row.type}
                onChange={(e) => updateDocument(i, "type", e.target.value)}
              >
                <option value="MANUAL">Manual</option>
                <option value="SPEC_SHEET">Spec Sheet</option>
                <option value="WARRANTY">Warranty</option>
                <option value="INSTALLATION_GUIDE">Install Guide</option>
                <option value="PARTS_LIST">Parts List</option>
                <option value="OTHER">Other</option>
              </select>
              <Input
                placeholder="Document title"
                value={row.title}
                onChange={(e) => updateDocument(i, "title", e.target.value)}
                className="text-sm"
              />
              <Input
                type="url"
                placeholder="https://…"
                value={row.externalUrl}
                onChange={(e) => updateDocument(i, "externalUrl", e.target.value)}
                className="text-sm"
              />
              <button
                type="button"
                onClick={() => removeDocument(i)}
                className="p-1 text-muted-foreground hover:text-destructive transition-colors mt-1"
                aria-label="Remove document"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Hidden serialized fields — populated in handleSubmit */}
      <input type="hidden" name="specs" value="" />
      <input type="hidden" name="maintenance" value="" />
      <input type="hidden" name="documents" value="" />

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Submitting…" : "Submit for Review"}
      </Button>
    </form>
  );
}
