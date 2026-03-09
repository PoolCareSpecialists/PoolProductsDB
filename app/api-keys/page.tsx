import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { syncUser } from "@/lib/sync-user";
import { ApiKeyManager } from "./api-key-manager";

export const metadata = {
  title: "API Keys | Pool Products DB",
  description: "Manage your API keys for the Pool Products DB REST API",
};

export default async function ApiKeysPage() {
  const { userId } = await auth();
  if (!userId) redirect("/account");

  const dbUser = await syncUser();
  if (!dbUser) redirect("/account");

  const apiKeys = await prisma.apiKey.findMany({
    where: { userId: dbUser.id },
    include: {
      usage: {
        where: {
          date: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Compute usage stats for each key
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const keysWithUsage = apiKeys.map((k) => {
    const dailyRequests = k.usage
      .filter((u) => u.date.getTime() === today.getTime())
      .reduce((sum, u) => sum + u.requests, 0);
    const monthlyRequests = k.usage.reduce((sum, u) => sum + u.requests, 0);

    return {
      id: k.id,
      name: k.name,
      keyPreview: `${k.key.slice(0, 12)}...${k.key.slice(-4)}`,
      plan: k.plan,
      dailyLimit: k.dailyLimit,
      monthlyLimit: k.monthlyLimit,
      dailyUsed: dailyRequests,
      monthlyUsed: monthlyRequests,
      isActive: k.isActive,
      lastUsedAt: k.lastUsedAt?.toISOString() ?? null,
      createdAt: k.createdAt.toISOString(),
    };
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">API Keys</h1>
        <p className="text-muted-foreground">
          Manage your API keys for the Pool Products DB REST API. Include your
          key in requests via the{" "}
          <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
            Authorization: Bearer &lt;key&gt;
          </code>{" "}
          header.
        </p>
      </div>

      <ApiKeyManager keys={keysWithUsage} />

      {/* Quick Reference */}
      <div className="mt-10 rounded-lg border bg-card p-6">
        <h2 className="font-semibold mb-4">Quick Start</h2>
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium mb-1">Search products</p>
            <code className="block bg-muted p-3 rounded text-xs font-mono break-all">
              curl -H &quot;Authorization: Bearer YOUR_KEY&quot; \<br />
              &nbsp;&nbsp;&quot;https://poolproductsdb.com/api/v1/products?q=hayward+pump&quot;
            </code>
          </div>
          <div>
            <p className="text-sm font-medium mb-1">Get product by ID</p>
            <code className="block bg-muted p-3 rounded text-xs font-mono break-all">
              curl -H &quot;Authorization: Bearer YOUR_KEY&quot; \<br />
              &nbsp;&nbsp;&quot;https://poolproductsdb.com/api/v1/products/PRODUCT_ID&quot;
            </code>
          </div>
          <div>
            <p className="text-sm font-medium mb-1">Lookup by UPC barcode</p>
            <code className="block bg-muted p-3 rounded text-xs font-mono break-all">
              curl -H &quot;Authorization: Bearer YOUR_KEY&quot; \<br />
              &nbsp;&nbsp;&quot;https://poolproductsdb.com/api/v1/products/upc/610377851886&quot;
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
