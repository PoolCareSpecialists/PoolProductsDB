import { ButtonLink } from "@/components/ui/button-link";
import { Database, Users, Globe, Lock } from "lucide-react";

export const metadata = {
  title: "About",
  description: "Learn about the Pool Products DB — a community-maintained swimming pool industry product database.",
};

const PRINCIPLES = [
  {
    icon: Database,
    title: "Complete & Accurate",
    description:
      "Every pool product — past and present — with full specs, maintenance schedules, and manufacturer documentation.",
  },
  {
    icon: Users,
    title: "Community Maintained",
    description:
      "Anyone can contribute. All submissions are reviewed by admins before going live to maintain data quality.",
  },
  {
    icon: Globe,
    title: "API Accessible",
    description:
      "Full REST API access so developers can integrate pool product data directly into their own applications.",
  },
  {
    icon: Lock,
    title: "Admin Controlled",
    description:
      "A strict approval workflow ensures nothing reaches the live database without admin verification.",
  },
];

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <h1 className="text-3xl font-bold mb-4">About Pool Products DB</h1>
      <p className="text-lg text-muted-foreground mb-12 leading-relaxed">
        Pool Products DB is a community-maintained master database for the swimming pool industry.
        Our goal is to be the single source of truth for every product that has ever been — or currently is — available in the pool industry.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
        {PRINCIPLES.map((item) => (
          <div key={item.title} className="rounded-lg border bg-card p-5 flex flex-col gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <item.icon className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="font-semibold">{item.title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-bold mb-3">What we store</h2>
      <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
        For each product we aim to capture: manufacturer and brand, model number and UPC, product category, full
        technical specifications (flow rate, voltage, dimensions, BTUs, etc.), manufacturer-recommended maintenance
        schedules, compatible replacement parts, compatible chemicals, and all manufacturer documentation (manuals,
        spec sheets, warranty documents, installation guides, and parts lists).
      </p>

      <div className="flex gap-3 mt-8">
        <ButtonLink href="/contribute">Contribute</ButtonLink>
        <ButtonLink variant="outline" href="/search">Browse Products</ButtonLink>
      </div>
    </div>
  );
}
