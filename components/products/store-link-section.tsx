"use client";

import { useState, useTransition } from "react";
import { ExternalLink, Trash2, Plus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  submitStoreLink,
  deleteStoreLink,
  POOL_RETAILERS,
} from "@/app/products/[id]/store-link/actions";

type StoreLink = {
  id: string;
  storeName: string;
  storeUrl: string;
  price: number | null;
  currency: string;
  addedById: string | null;
};

type Props = {
  productId: string;
  storeLinks: StoreLink[];
  isSignedIn: boolean;
  dbUserId: string | null;
  isAdmin: boolean;
};

export function StoreLinkSection({
  productId,
  storeLinks,
  isSignedIn,
  dbUserId,
  isAdmin,
}: Props) {
  const [showForm, setShowForm] = useState(false);
  const [storeName, setStoreName] = useState("");
  const [storeUrl, setStoreUrl] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      try {
        await submitStoreLink(productId, { storeName, storeUrl, price });
        setShowForm(false);
        setStoreName("");
        setStoreUrl("");
        setPrice("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to add store link.");
      }
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      try {
        await deleteStoreLink(id);
      } catch (err) {
        console.error(err);
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* Store cards */}
      {storeLinks.length === 0 && !showForm ? (
        <div className="text-center py-8 text-muted-foreground rounded-lg border border-dashed">
          <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-20" />
          <p className="text-sm">No online stores listed yet.</p>
          {isSignedIn && (
            <p className="text-xs mt-1">Be the first to add where this product is sold!</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {storeLinks.map((link) => {
            const canDelete = isAdmin || link.addedById === dbUserId;
            return (
              <div
                key={link.id}
                className="rounded-lg border p-4 flex flex-col gap-2 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-1">
                  <p className="font-semibold text-sm">{link.storeName}</p>
                  {canDelete && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-red-600 shrink-0"
                      onClick={() => handleDelete(link.id)}
                      disabled={isPending}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                {link.price !== null && (
                  <p className="text-lg font-bold text-green-700">
                    ${link.price.toFixed(2)}{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      {link.currency}
                    </span>
                  </p>
                )}
                <a
                  href={link.storeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline mt-auto"
                >
                  Buy Now
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            );
          })}
        </div>
      )}

      {/* Add store button / form */}
      {isSignedIn && !showForm && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowForm(true)}
          className="mt-2"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Add a Store
        </Button>
      )}
      {!isSignedIn && (
        <p className="text-sm text-muted-foreground">
          <a href="/sign-in" className="underline hover:text-foreground">
            Sign in
          </a>{" "}
          to add a store listing.
        </p>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-lg border p-5 space-y-4 bg-muted/20"
        >
          <h3 className="font-semibold">Add Store Listing</h3>

          <div className="space-y-1">
            <label className="text-sm font-medium">Retailer *</label>
            <select
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              required
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">— Select a retailer —</option>
              {POOL_RETAILERS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Product URL *</label>
            <input
              type="url"
              placeholder="https://www.lesliespool.com/product/..."
              value={storeUrl}
              onChange={(e) => setStoreUrl(e.target.value)}
              required
              className="w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Price (optional)</label>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">$</span>
              <input
                type="number"
                placeholder="0.00"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-32 rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <span className="text-sm text-muted-foreground">USD</span>
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? "Adding…" : "Add Store"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
