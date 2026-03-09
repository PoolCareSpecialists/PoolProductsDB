"use client";

import { useState, useTransition } from "react";
import { Star, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { submitReview, deleteReview } from "@/app/products/[id]/review/actions";

type Review = {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  createdAt: string;
  user: { id: string; name: string | null; clerkId: string | null };
};

type Props = {
  productId: string;
  reviews: Review[];
  avgRating: number | null;
  isSignedIn: boolean;
  dbUserId: string | null;
  isAdmin: boolean;
};

export function ReviewSection({
  productId,
  reviews,
  avgRating,
  isSignedIn,
  dbUserId,
  isAdmin,
}: Props) {
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const hasReviewed = dbUserId
    ? reviews.some((r) => r.user.id === dbUserId)
    : false;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      try {
        await submitReview(productId, { rating, title, body });
        setShowForm(false);
        setTitle("");
        setBody("");
        setRating(5);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to submit review.");
      }
    });
  }

  function handleDelete(reviewId: string) {
    startTransition(async () => {
      try {
        await deleteReview(reviewId);
      } catch (err) {
        console.error(err);
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Summary row */}
      {avgRating !== null && reviews.length > 0 && (
        <div className="flex items-center gap-3">
          <StarPicker value={Math.round(avgRating)} readonly />
          <span className="text-2xl font-bold">{avgRating.toFixed(1)}</span>
          <span className="text-muted-foreground text-sm">
            out of 5 · {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
          </span>
        </div>
      )}

      {/* Write a review button */}
      {isSignedIn && !hasReviewed && !showForm && (
        <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
          <Star className="h-4 w-4 mr-1.5" />
          Write a Review
        </Button>
      )}
      {!isSignedIn && (
        <p className="text-sm text-muted-foreground">
          <a href="/sign-in" className="underline hover:text-foreground">
            Sign in
          </a>{" "}
          to write a review.
        </p>
      )}

      {/* Review form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-lg border p-5 space-y-4 bg-muted/20"
        >
          <h3 className="font-semibold">Your Review</h3>

          {/* Star picker */}
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                onMouseEnter={() => setHoverRating(n)}
                onMouseLeave={() => setHoverRating(0)}
                className="focus:outline-none"
              >
                <Star
                  className={`h-7 w-7 transition-colors ${
                    n <= (hoverRating || rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "fill-muted text-muted-foreground/30"
                  }`}
                />
              </button>
            ))}
            <span className="ml-2 text-sm text-muted-foreground">
              {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][hoverRating || rating]}
            </span>
          </div>

          <input
            type="text"
            placeholder="Review title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />

          <textarea
            placeholder="Share your experience with this product..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            rows={4}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? "Submitting…" : "Submit Review"}
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

      {/* Review list */}
      {reviews.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          <Star className="h-8 w-8 mx-auto mb-2 opacity-20" />
          <p className="text-sm">No reviews yet. Be the first!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => {
            const canDelete = isAdmin || review.user.id === dbUserId;
            return (
              <div key={review.id} className="rounded-lg border p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <StarPicker value={review.rating} readonly />
                    {review.title && (
                      <p className="font-semibold">{review.title}</p>
                    )}
                  </div>
                  {canDelete && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-red-600"
                      onClick={() => handleDelete(review.id)}
                      disabled={isPending}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
                <p className="text-sm leading-relaxed">{review.body}</p>
                <p className="text-xs text-muted-foreground">
                  {review.user.name ?? "Anonymous"} ·{" "}
                  {new Date(review.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StarPicker({
  value,
  readonly = false,
}: {
  value: number;
  readonly?: boolean;
}) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`h-4 w-4 ${
            n <= value
              ? "fill-yellow-400 text-yellow-400"
              : "fill-muted text-muted-foreground/30"
          } ${readonly ? "" : "cursor-pointer"}`}
        />
      ))}
    </div>
  );
}
