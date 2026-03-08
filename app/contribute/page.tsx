import Link from "next/link";
import { ButtonLink } from "@/components/ui/button-link";
import { Plus, Pencil, Key, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Contribute",
  description: "Help build the most complete swimming pool product database.",
};

const WAYS_TO_CONTRIBUTE = [
  {
    icon: Plus,
    title: "Add a missing product",
    description:
      "Know of a product that isn&apos;t in the database yet? Submit it with as much detail as you have — specs, images, manuals.",
    href: "/products/new",
    cta: "Add product",
  },
  {
    icon: Pencil,
    title: "Improve existing data",
    description:
      "Found an error or missing spec on a product page? Use the &apos;Suggest Edit&apos; button on any product to submit a correction.",
    href: "/search",
    cta: "Find a product",
  },
  {
    icon: Key,
    title: "Use the API",
    description:
      "Building something? Our REST API gives you programmatic access to the full database. Generate an API key from your account.",
    href: "/account",
    cta: "Get API access",
  },
];

export default function ContributePage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <h1 className="text-3xl font-bold mb-4">Contribute to Pool Products DB</h1>
      <p className="text-lg text-muted-foreground mb-12 leading-relaxed">
        This database is built by the pool industry community. Every contribution — big or small — helps make
        this a more complete and useful resource for everyone.
      </p>

      <div className="space-y-4 mb-12">
        {WAYS_TO_CONTRIBUTE.map((item) => (
          <div
            key={item.title}
            className="rounded-lg border bg-card p-5 flex items-start gap-4"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
              <item.icon className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold">{item.title}</h2>
              <p
                className="text-sm text-muted-foreground mt-1 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: item.description }}
              />
            </div>
            <ButtonLink size="sm" variant="outline" className="shrink-0 mt-0.5" href={item.href}>
              {item.cta}
              <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </ButtonLink>
          </div>
        ))}
      </div>

      <div className="rounded-lg border bg-muted/30 p-6">
        <h2 className="font-semibold mb-2">How the approval process works</h2>
        <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
          <li>You submit a new product or suggest an edit to an existing one.</li>
          <li>An admin reviews your submission for accuracy and completeness.</li>
          <li>Once approved, the data goes live in the database and API.</li>
          <li>All changes are tracked in the edit history for full transparency.</li>
        </ol>
        <p className="text-xs text-muted-foreground mt-4">
          Sign-in is required to submit contributions.{" "}
          <Link href="/account" className="underline hover:text-foreground">
            Create an account →
          </Link>
        </p>
      </div>
    </div>
  );
}
