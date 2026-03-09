import { ButtonLink } from "@/components/ui/button-link";
import { Check, Zap, Building2, Rocket } from "lucide-react";

export const metadata = {
  title: "API Pricing | Pool Products DB",
  description:
    "Free consumer access with paid API tiers for developers and businesses",
};

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    description: "For hobbyists and personal projects",
    icon: Zap,
    highlight: false,
    cta: "Get Free Key",
    ctaHref: "/api-keys",
    limits: { daily: "100", monthly: "1,000" },
    features: [
      "100 API requests/day",
      "1,000 requests/month",
      "Full product data",
      "Search & UPC lookup",
      "Community support",
    ],
  },
  {
    name: "Developer",
    price: "$49",
    period: "/month",
    description: "For pool service apps and tools",
    icon: Rocket,
    highlight: true,
    cta: "Start Developer Plan",
    ctaHref: "/api-keys",
    limits: { daily: "1,000", monthly: "10,000" },
    features: [
      "1,000 API requests/day",
      "10,000 requests/month",
      "Full product data + reviews",
      "Bulk CSV export",
      "Priority email support",
    ],
  },
  {
    name: "Startup",
    price: "$199",
    period: "/month",
    description: "For growing pool industry businesses",
    icon: Building2,
    highlight: false,
    cta: "Start Startup Plan",
    ctaHref: "/api-keys",
    limits: { daily: "5,000", monthly: "50,000" },
    features: [
      "5,000 API requests/day",
      "50,000 requests/month",
      "Full product data + reviews",
      "Bulk CSV export",
      "Store link data",
      "Priority support + SLA",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large distributors and platforms",
    icon: Building2,
    highlight: false,
    cta: "Contact Sales",
    ctaHref: "mailto:api@poolproductsdb.com",
    limits: { daily: "25,000+", monthly: "250,000+" },
    features: [
      "25,000+ API requests/day",
      "250,000+ requests/month",
      "Full database access",
      "Bulk CSV & JSON export",
      "Webhook notifications",
      "Dedicated support + custom SLA",
      "White-label data licensing",
    ],
  },
];

export default function PricingPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">
          Pool Product Data, Your Way
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Free to browse. Paid API access for developers and businesses who need
          programmatic access to the pool industry&apos;s most complete product database.
        </p>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-16">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-xl border bg-card p-6 flex flex-col ${
              plan.highlight
                ? "border-blue-500 ring-2 ring-blue-500/20 relative"
                : ""
            }`}
          >
            {plan.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Most Popular
                </span>
              </div>
            )}

            <div className="mb-4">
              <plan.icon className="h-6 w-6 text-blue-600 mb-2" />
              <h2 className="text-xl font-bold">{plan.name}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {plan.description}
              </p>
            </div>

            <div className="mb-6">
              <span className="text-3xl font-bold">{plan.price}</span>
              <span className="text-muted-foreground">{plan.period}</span>
            </div>

            <div className="space-y-2 mb-6 flex-1">
              {plan.features.map((feature) => (
                <div key={feature} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <ButtonLink
              href={plan.ctaHref}
              variant={plan.highlight ? "default" : "outline"}
              className="w-full"
            >
              {plan.cta}
            </ButtonLink>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          <FaqItem
            q="Is the website free to use?"
            a="Yes! Browsing products, searching, scanning barcodes, writing reviews, and contributing data is 100% free. API pricing only applies to programmatic REST API access."
          />
          <FaqItem
            q="What counts as an API request?"
            a="Each call to /api/v1/* endpoints counts as one request. Browsing the website does not count toward your API limits."
          />
          <FaqItem
            q="Can I switch plans at any time?"
            a="Yes. Upgrades take effect immediately. Downgrades take effect at the start of your next billing cycle."
          />
          <FaqItem
            q="What happens if I hit my rate limit?"
            a="You'll receive a 429 Too Many Requests response with headers showing your limit, usage, and reset time. No data is lost — just retry later or upgrade your plan."
          />
          <FaqItem
            q="What data is included in the API?"
            a="All plans include full product data: names, identifiers (UPC, EAN, ASIN, SKU, model numbers), specifications, descriptions, images, maintenance schedules, pricing (MSRP, MAP), certifications, and more."
          />
          <FaqItem
            q="Do you offer bulk data exports?"
            a="Developer plans and above include bulk CSV export at /api/v1/export/csv. Enterprise plans also support full JSON dumps and custom data feeds."
          />
        </div>
      </div>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <div className="rounded-lg border bg-card p-5">
      <h3 className="font-semibold text-sm mb-2">{q}</h3>
      <p className="text-sm text-muted-foreground">{a}</p>
    </div>
  );
}
