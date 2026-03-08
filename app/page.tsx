import Link from "next/link";
import { ButtonLink } from "@/components/ui/button-link";
import { Search, Database, BookOpen, Wrench } from "lucide-react";

const FEATURE_CARDS = [
  {
    icon: Search,
    title: "Search & UPC Lookup",
    description:
      "Find any pool product by name, model number, brand, or scan a barcode to get instant product details.",
  },
  {
    icon: Database,
    title: "Complete Specs",
    description:
      "Technical specifications, dimensions, flow rates, electrical requirements — everything in one place.",
  },
  {
    icon: Wrench,
    title: "Maintenance Schedules",
    description:
      "Manufacturer-recommended maintenance intervals and tasks so you never miss a service item.",
  },
  {
    icon: BookOpen,
    title: "Manuals & Documents",
    description:
      "Installation guides, spec sheets, warranty documents, and parts lists — all archived and searchable.",
  },
];

const EXAMPLE_CATEGORIES = [
  { name: "Pumps", slug: "pumps" },
  { name: "Filters", slug: "filters" },
  { name: "Heaters", slug: "heaters" },
  { name: "Chemicals", slug: "chemicals" },
  { name: "Automation", slug: "automation" },
  { name: "Lighting", slug: "lighting" },
  { name: "Covers", slug: "covers" },
  { name: "Cleaners", slug: "cleaners" },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-50 to-background py-20 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            The Swimming Pool Industry
            <br />
            <span className="text-blue-600">Product Database</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            Specs, maintenance schedules, manuals, and compatibility data for
            every pool product — past and present. Community maintained, API
            accessible.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <ButtonLink size="lg" href="/search">
              <Search className="mr-2 h-4 w-4" />
              Search Products
            </ButtonLink>
            <ButtonLink size="lg" variant="outline" href="/products">
              Browse All
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold text-center mb-10">
            Everything about every pool product
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURE_CARDS.map((card) => (
              <div
                key={card.title}
                className="rounded-lg border bg-card p-5 flex flex-col gap-3"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <card.icon className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="font-semibold">{card.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Browse by Category */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold text-center mb-10">
            Browse by Category
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {EXAMPLE_CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/products?category=${cat.slug}`}
                className="rounded-lg border bg-card p-4 text-center hover:border-blue-400 hover:shadow-sm transition-all group"
              >
                <span className="font-medium group-hover:text-blue-600 transition-colors">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* API CTA */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold mb-3">Open REST API</h2>
          <p className="text-muted-foreground mb-6">
            Access the full database programmatically. Use our API to integrate
            pool product data into your own applications.
          </p>
          <div className="bg-muted rounded-lg p-4 text-left font-mono text-sm mb-6 overflow-x-auto">
            <span className="text-blue-600">GET</span>{" "}
            <span className="text-green-600">/api/v1/products?q=hayward+super+pump</span>
          </div>
          <ButtonLink variant="outline" href="/api/v1/products">
            Explore the API
          </ButtonLink>
        </div>
      </section>
    </div>
  );
}
