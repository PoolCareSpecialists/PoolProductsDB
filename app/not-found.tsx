import { ButtonLink } from "@/components/ui/button-link";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-20 max-w-lg text-center">
      <SearchX className="h-16 w-16 text-muted-foreground/30 mx-auto mb-6" />
      <h1 className="text-3xl font-bold mb-3">Page not found</h1>
      <p className="text-muted-foreground mb-8">
        We couldn&apos;t find what you were looking for.
      </p>
      <div className="flex gap-3 justify-center">
        <ButtonLink href="/search">Search Products</ButtonLink>
        <ButtonLink variant="outline" href="/">Go Home</ButtonLink>
      </div>
    </div>
  );
}
