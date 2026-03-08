import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { ButtonLink } from "@/components/ui/button-link";
import { ArrowLeft } from "lucide-react";
import { SuggestEditForm } from "./suggest-edit-form";

export const metadata = { title: "Suggest Edit" };

export default async function SuggestEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) redirect(`/account`);

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      brand: { include: { manufacturer: true } },
      category: true,
      specs: { orderBy: { sortOrder: "asc" } },
      maintenanceSchedules: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!product) notFound();

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <ButtonLink variant="ghost" size="sm" href={`/products/${id}`}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Product
        </ButtonLink>
      </div>

      <h1 className="text-2xl font-bold mb-1">Suggest an Edit</h1>
      <p className="text-sm text-muted-foreground mb-1">
        {product.name} — {product.brand.manufacturer.name}
      </p>
      <p className="text-sm text-muted-foreground mb-8">
        Fill in only the fields you want to change. Leave others blank.
        An admin will review your suggestion before it goes live.
      </p>

      <SuggestEditForm product={product} />
    </div>
  );
}
