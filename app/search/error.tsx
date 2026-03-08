"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ServerCrash } from "lucide-react";

export default function SearchError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const isDbDown =
    error.message?.includes("ECONNREFUSED") ||
    error.message?.includes("connect") ||
    error.digest?.includes("ECONNREFUSED");

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
        <ServerCrash className="h-12 w-12 text-muted-foreground/40" />
        <div>
          <p className="text-lg font-medium">
            {isDbDown ? "Database unavailable" : "Something went wrong"}
          </p>
          <p className="text-muted-foreground text-sm mt-1 max-w-sm">
            {isDbDown
              ? "The database is not reachable. Make sure PostgreSQL is running via Docker Compose."
              : "An unexpected error occurred loading search results."}
          </p>
        </div>
        <Button variant="outline" onClick={reset}>
          Try again
        </Button>
      </div>
    </div>
  );
}
