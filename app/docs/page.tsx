import { ButtonLink } from "@/components/ui/button-link";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "API Documentation | Pool Products DB",
  description: "REST API reference for the Pool Products DB",
};

const endpoints = [
  {
    method: "GET",
    path: "/api/v1/products",
    description: "Search and list products",
    auth: true,
    params: [
      { name: "q", type: "string", description: "Search query (name, model, UPC, EAN, ASIN, SKU, brand)" },
      { name: "category", type: "string", description: "Filter by category slug" },
      { name: "brand", type: "string", description: "Filter by brand name (partial match)" },
      { name: "status", type: "string", description: "Filter by status: ACTIVE, DISCONTINUED, UNKNOWN" },
      { name: "page", type: "number", description: "Page number (default: 1)" },
      { name: "limit", type: "number", description: "Results per page, max 100 (default: 20)" },
    ],
    response: `{
  "data": [
    {
      "id": "clx...",
      "name": "Hayward Super Pump",
      "modelNumber": "SP2610X15",
      "upc": "610377851886",
      "ean": null,
      "asin": "B001HBJMBY",
      "sku": null,
      "msrp": "459.99",
      "map": "399.99",
      "status": "ACTIVE",
      "brand": { "name": "Hayward", "manufacturer": { "name": "Hayward Industries" } },
      "category": { "name": "Pool Pumps", "slug": "pool-pumps" },
      ...
    }
  ],
  "pagination": {
    "total": 142,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}`,
  },
  {
    method: "GET",
    path: "/api/v1/products/:id",
    description: "Get full product details including specs, reviews, and store links",
    auth: true,
    params: [],
    response: `{
  "data": {
    "id": "clx...",
    "name": "Hayward Super Pump",
    "specs": [{ "specKey": "Max Flow Rate", "specValue": "125", "unit": "GPM" }],
    "reviews": [{ "rating": 5, "title": "Great pump", "body": "...", "user": { "name": "Doug" } }],
    "storeLinks": [{ "storeName": "Leslie's", "storeUrl": "https://...", "price": "399.99" }],
    "avgRating": 4.5,
    "features": ["Variable speed motor", "Self-priming"],
    "certifications": ["NSF/ANSI 50", "UL Listed"],
    ...
  }
}`,
  },
  {
    method: "GET",
    path: "/api/v1/products/upc/:upc",
    description: "Look up a product by its UPC barcode",
    auth: true,
    params: [],
    response: `{
  "data": {
    "id": "clx...",
    "name": "Hayward Super Pump",
    "upc": "610377851886",
    ...
  }
}`,
  },
  {
    method: "GET",
    path: "/api/v1/export/csv",
    description: "Bulk export products as CSV (Developer+ plan required)",
    auth: true,
    plan: "DEVELOPER",
    params: [
      { name: "category", type: "string", description: "Filter by category slug" },
      { name: "brand", type: "string", description: "Filter by brand name" },
      { name: "status", type: "string", description: "Filter by product status" },
      { name: "limit", type: "number", description: "Max rows, up to 10,000 (default: 1,000)" },
    ],
    response: `Content-Type: text/csv
Content-Disposition: attachment; filename="pool-products-export-2024-01-15.csv"

id,name,manufacturer,brand,category,parent_category,model_number,upc,...`,
  },
  {
    method: "GET",
    path: "/api/v1/manufacturers",
    description: "List all manufacturers with their brands",
    auth: false,
    params: [
      { name: "q", type: "string", description: "Filter by manufacturer name" },
    ],
    response: `{
  "data": [
    {
      "id": "clx...",
      "name": "Hayward Industries",
      "brands": [{ "id": "clx...", "name": "Hayward" }]
    }
  ]
}`,
  },
  {
    method: "GET",
    path: "/api/v1/categories",
    description: "List all categories in a tree structure",
    auth: false,
    params: [],
    response: `{
  "data": [
    {
      "id": "clx...",
      "name": "Equipment",
      "slug": "equipment",
      "children": [
        { "name": "Pool Pumps", "slug": "pool-pumps", "children": [] }
      ]
    }
  ]
}`,
  },
];

export default function DocsPage() {
  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2">API Documentation</h1>
        <p className="text-muted-foreground">
          The Pool Products DB REST API gives you programmatic access to the
          pool industry&apos;s most complete product database. All responses are JSON
          unless otherwise noted.
        </p>
      </div>

      {/* Auth section */}
      <section className="mb-10 rounded-lg border bg-card p-6">
        <h2 className="text-xl font-bold mb-3">Authentication</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Product endpoints require an API key. Include it in your request using
          one of these methods:
        </p>
        <div className="space-y-3 mb-4">
          <div>
            <p className="text-sm font-medium mb-1">Header (recommended)</p>
            <code className="block bg-muted p-3 rounded text-xs font-mono">
              Authorization: Bearer ppdb_live_abc123...
            </code>
          </div>
          <div>
            <p className="text-sm font-medium mb-1">Query parameter</p>
            <code className="block bg-muted p-3 rounded text-xs font-mono">
              /api/v1/products?q=pump&apikey=ppdb_live_abc123...
            </code>
          </div>
        </div>
        <div className="flex gap-2">
          <ButtonLink size="sm" href="/api-keys">
            Get Your API Key
          </ButtonLink>
          <ButtonLink size="sm" variant="outline" href="/pricing">
            View Plans
          </ButtonLink>
        </div>
      </section>

      {/* Rate Limiting */}
      <section className="mb-10 rounded-lg border bg-card p-6">
        <h2 className="text-xl font-bold mb-3">Rate Limiting</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Requests are rate-limited based on your plan. The following headers
          are included in every response:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 pr-4 font-medium">Header</th>
                <th className="text-left py-2 font-medium">Description</th>
              </tr>
            </thead>
            <tbody className="font-mono text-xs">
              <tr className="border-b">
                <td className="py-2 pr-4">X-RateLimit-Limit</td>
                <td className="py-2 font-sans text-sm">Daily request limit</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4">X-RateLimit-Remaining</td>
                <td className="py-2 font-sans text-sm">Requests remaining today</td>
              </tr>
              <tr>
                <td className="py-2 pr-4">X-RateLimit-Plan</td>
                <td className="py-2 font-sans text-sm">Your current plan tier</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm text-muted-foreground mt-3">
          When you exceed your limit, you&apos;ll receive a{" "}
          <code className="bg-muted px-1 rounded">429 Too Many Requests</code>{" "}
          response.
        </p>
      </section>

      {/* Error Codes */}
      <section className="mb-10 rounded-lg border bg-card p-6">
        <h2 className="text-xl font-bold mb-3">Error Codes</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 pr-4 font-medium">Code</th>
                <th className="text-left py-2 font-medium">Meaning</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-2 pr-4"><code className="bg-muted px-1.5 py-0.5 rounded text-xs">401</code></td>
                <td className="py-2">Missing or invalid API key</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4"><code className="bg-muted px-1.5 py-0.5 rounded text-xs">403</code></td>
                <td className="py-2">Key revoked, expired, or plan insufficient</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4"><code className="bg-muted px-1.5 py-0.5 rounded text-xs">404</code></td>
                <td className="py-2">Product not found</td>
              </tr>
              <tr>
                <td className="py-2 pr-4"><code className="bg-muted px-1.5 py-0.5 rounded text-xs">429</code></td>
                <td className="py-2">Rate limit exceeded (daily or monthly)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Endpoints */}
      <h2 className="text-xl font-bold mb-6">Endpoints</h2>
      <div className="space-y-8">
        {endpoints.map((ep) => (
          <section key={ep.path} className="rounded-lg border bg-card overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b bg-muted/30 flex items-center gap-3 flex-wrap">
              <Badge
                variant={ep.method === "GET" ? "default" : "secondary"}
                className="font-mono text-xs"
              >
                {ep.method}
              </Badge>
              <code className="text-sm font-mono font-medium">{ep.path}</code>
              {ep.auth && (
                <Badge variant="outline" className="text-xs">
                  Requires API Key
                </Badge>
              )}
              {"plan" in ep && ep.plan && (
                <Badge variant="secondary" className="text-xs">
                  {ep.plan}+ plan
                </Badge>
              )}
            </div>

            <div className="p-4 space-y-4">
              <p className="text-sm text-muted-foreground">{ep.description}</p>

              {/* Parameters */}
              {ep.params.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-2">Parameters</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-1.5 pr-4 font-medium text-xs">Name</th>
                          <th className="text-left py-1.5 pr-4 font-medium text-xs">Type</th>
                          <th className="text-left py-1.5 font-medium text-xs">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ep.params.map((p) => (
                          <tr key={p.name} className="border-b last:border-0">
                            <td className="py-1.5 pr-4">
                              <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                                {p.name}
                              </code>
                            </td>
                            <td className="py-1.5 pr-4 text-xs text-muted-foreground">
                              {p.type}
                            </td>
                            <td className="py-1.5 text-xs text-muted-foreground">
                              {p.description}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Response */}
              <div>
                <h3 className="text-sm font-semibold mb-2">Response</h3>
                <pre className="bg-muted rounded-lg p-4 text-xs font-mono overflow-x-auto whitespace-pre-wrap">
                  {ep.response}
                </pre>
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* Footer CTA */}
      <div className="mt-10 text-center">
        <p className="text-muted-foreground mb-4">
          Ready to start building?
        </p>
        <div className="flex gap-3 justify-center">
          <ButtonLink href="/api-keys">Get Your API Key</ButtonLink>
          <ButtonLink variant="outline" href="/pricing">
            View Plans
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
