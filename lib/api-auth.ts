import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export type ApiContext = {
  apiKeyId: string;
  userId: string;
  plan: string;
};

const PLAN_LIMITS: Record<string, { daily: number; monthly: number }> = {
  FREE: { daily: 100, monthly: 1_000 },
  DEVELOPER: { daily: 1_000, monthly: 10_000 },
  STARTUP: { daily: 5_000, monthly: 50_000 },
  ENTERPRISE: { daily: 25_000, monthly: 250_000 },
};

/**
 * Validates an API key from the request and enforces rate limits.
 * Returns the API context on success, or a NextResponse error on failure.
 */
export async function validateApiKey(
  request: NextRequest
): Promise<ApiContext | NextResponse> {
  // Extract key from Authorization header or query param
  const authHeader = request.headers.get("Authorization");
  let key: string | null = null;

  if (authHeader?.startsWith("Bearer ")) {
    key = authHeader.slice(7).trim();
  }

  if (!key) {
    key = request.nextUrl.searchParams.get("apikey");
  }

  if (!key) {
    return NextResponse.json(
      {
        error: "API key required",
        message:
          "Include your API key via Authorization: Bearer <key> header or ?apikey=<key> parameter. Get a free key at /api-keys.",
      },
      { status: 401 }
    );
  }

  // Look up the key
  const apiKey = await prisma.apiKey.findUnique({
    where: { key },
    select: {
      id: true,
      userId: true,
      plan: true,
      dailyLimit: true,
      monthlyLimit: true,
      isActive: true,
      expiresAt: true,
    },
  });

  if (!apiKey) {
    return NextResponse.json(
      { error: "Invalid API key" },
      { status: 401 }
    );
  }

  if (!apiKey.isActive) {
    return NextResponse.json(
      { error: "API key is deactivated" },
      { status: 403 }
    );
  }

  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
    return NextResponse.json(
      { error: "API key has expired" },
      { status: 403 }
    );
  }

  // Check rate limits
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const endpoint = new URL(request.url).pathname;

  // Get today's usage across all endpoints
  const [dailyUsage, monthlyUsage] = await Promise.all([
    prisma.apiUsage.aggregate({
      where: { apiKeyId: apiKey.id, date: today },
      _sum: { requests: true },
    }),
    prisma.apiUsage.aggregate({
      where: {
        apiKeyId: apiKey.id,
        date: { gte: firstOfMonth },
      },
      _sum: { requests: true },
    }),
  ]);

  const limits = PLAN_LIMITS[apiKey.plan] ?? PLAN_LIMITS.FREE;
  const dailyCount = dailyUsage._sum.requests ?? 0;
  const monthlyCount = monthlyUsage._sum.requests ?? 0;

  if (dailyCount >= limits.daily) {
    return NextResponse.json(
      {
        error: "Daily rate limit exceeded",
        limit: limits.daily,
        used: dailyCount,
        plan: apiKey.plan,
        message: "Upgrade your plan at /pricing for higher limits.",
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": String(limits.daily),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": new Date(today.getTime() + 86400000).toISOString(),
        },
      }
    );
  }

  if (monthlyCount >= limits.monthly) {
    return NextResponse.json(
      {
        error: "Monthly rate limit exceeded",
        limit: limits.monthly,
        used: monthlyCount,
        plan: apiKey.plan,
        message: "Upgrade your plan at /pricing for higher limits.",
      },
      { status: 429 }
    );
  }

  // Track usage — upsert for today + endpoint
  await Promise.all([
    prisma.apiUsage.upsert({
      where: {
        apiKeyId_date_endpoint: {
          apiKeyId: apiKey.id,
          date: today,
          endpoint,
        },
      },
      update: { requests: { increment: 1 } },
      create: {
        apiKeyId: apiKey.id,
        date: today,
        endpoint,
        requests: 1,
      },
    }),
    prisma.apiKey.update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date() },
    }),
  ]);

  return {
    apiKeyId: apiKey.id,
    userId: apiKey.userId,
    plan: apiKey.plan,
  };
}

/**
 * Helper to add rate-limit headers to successful responses.
 */
export function withRateLimitHeaders(
  response: NextResponse,
  plan: string,
  dailyUsed: number
): NextResponse {
  const limits = PLAN_LIMITS[plan] ?? PLAN_LIMITS.FREE;
  response.headers.set("X-RateLimit-Limit", String(limits.daily));
  response.headers.set("X-RateLimit-Remaining", String(Math.max(0, limits.daily - dailyUsed - 1)));
  response.headers.set("X-RateLimit-Plan", plan);
  return response;
}
