import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ButtonLink } from "@/components/ui/button-link";
import { ArrowLeft, Plus, CheckCircle } from "lucide-react";
import { NewProductForm } from "./new-product-form";

export const metadata = { title: "Add a Product" };

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ submitted?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/account");

  const { submitted } = await searchParams;

  if (submitted === "1") {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-6">
          <ButtonLink variant="ghost" size="sm" href="/products">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Products
          </ButtonLink>
        </div>

        <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="h-7 w-7 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-2">Submission Received!</h1>
            <p className="text-muted-foreground max-w-sm">
              Your product submission is now in the pending queue. An admin will
              review it and publish it once approved. Thank you for contributing!
            </p>
          </div>
          <div className="flex gap-3 mt-2">
            <ButtonLink href="/products/new" variant="outline" size="sm">
              Submit Another
            </ButtonLink>
            <ButtonLink href="/products" size="sm">
              Browse Products
            </ButtonLink>
          </div>
        </div>
      </div>
    );
  }

  const [manufacturers, categories] = await Promise.all([
    prisma.manufacturer.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.category.findMany({
      select: { id: true, name: true, slug: true, parentId: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <ButtonLink variant="ghost" size="sm" href="/products">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Products
        </ButtonLink>
      </div>

      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
          <Plus className="h-5 w-5 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold">Add a Product</h1>
      </div>
      <p className="text-muted-foreground mb-8">
        Submit a new pool product for admin review. Your submission goes into a pending queue and
        will go live once an admin approves it.
      </p>

      <NewProductForm manufacturers={manufacturers} categories={categories} />
    </div>
  );
}
