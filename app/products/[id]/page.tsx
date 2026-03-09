import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import Link from "next/link";
import {
  ExternalLink,
  FileText,
  Wrench,
  Package,
  Beaker,
  Pencil,
} from "lucide-react";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { brand: true },
  });
  if (!product) return { title: "Product Not Found" };
  return { title: `${product.name} — ${product.brand.name}` };
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      brand: { include: { manufacturer: true } },
      category: { include: { parent: true } },
      images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }] },
      specs: { orderBy: { sortOrder: "asc" } },
      maintenanceSchedules: { orderBy: { sortOrder: "asc" } },
      documents: { orderBy: { createdAt: "asc" } },
      replacementPartsFrom: {
        include: {
          compatibleProduct: {
            include: { brand: true, images: { where: { isPrimary: true }, take: 1 } },
          },
        },
      },
      compatibleChemicalsFrom: {
        include: {
          chemicalProduct: {
            include: { brand: true, images: { where: { isPrimary: true }, take: 1 } },
          },
        },
      },
    },
  });

  if (!product) notFound();

  const primaryImage = product.images.find((i) => i.isPrimary) ?? product.images[0];
  const breadcrumb = [
    product.category.parent?.name,
    product.category.name,
  ].filter(Boolean);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground mb-6 flex gap-1 flex-wrap">
        <Link href="/products" className="hover:text-foreground">Products</Link>
        {breadcrumb.map((crumb) => (
          <span key={crumb} className="flex gap-1">
            <span>/</span>
            <span>{crumb}</span>
          </span>
        ))}
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Image */}
        <div className="lg:col-span-1">
          <div className="rounded-lg border bg-muted/30 aspect-square flex items-center justify-center overflow-hidden">
            {primaryImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={primaryImage.url}
                alt={primaryImage.altText ?? product.name}
                className="w-full h-full object-contain p-4"
              />
            ) : (
              <div className="text-6xl font-bold text-muted-foreground/20">
                {product.name[0]}
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
              {product.images.map((img) => (
                <div
                  key={img.id}
                  className="w-16 h-16 shrink-0 rounded border bg-muted/30 overflow-hidden"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt={img.altText ?? ""}
                    className="w-full h-full object-contain p-1"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Core Info */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-sm text-muted-foreground">
                {product.brand.manufacturer.name}
              </span>
              <span className="text-muted-foreground">·</span>
              <span className="text-sm text-muted-foreground">
                {product.brand.name}
              </span>
              {product.status !== "ACTIVE" && (
                <Badge variant="secondary">{product.status}</Badge>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">{product.name}</h1>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
            {product.modelNumber && (
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Model #</p>
                <p className="font-mono font-medium">{product.modelNumber}</p>
              </div>
            )}
            {product.upc && (
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">UPC</p>
                <p className="font-mono font-medium">{product.upc}</p>
              </div>
            )}
            {product.sku && (
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">SKU</p>
                <p className="font-mono font-medium">{product.sku}</p>
              </div>
            )}
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">Category</p>
              <p className="font-medium">{product.category.name}</p>
            </div>
          </div>

          {product.description && (
            <p className="text-muted-foreground leading-relaxed">
              {product.description}
            </p>
          )}

          <div className="flex gap-2 mt-2">
            <ButtonLink size="sm" variant="outline" href={`/products/${product.id}/suggest-edit`}>
              <Pencil className="h-3.5 w-3.5 mr-1.5" />
              Suggest Edit
            </ButtonLink>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="specs">
        <TabsList className="mb-4">
          <TabsTrigger value="specs">
            Specifications ({product.specs.length})
          </TabsTrigger>
          <TabsTrigger value="maintenance">
            Maintenance ({product.maintenanceSchedules.length})
          </TabsTrigger>
          <TabsTrigger value="documents">
            Documents ({product.documents.length})
          </TabsTrigger>
          <TabsTrigger value="parts">
            Compatible Parts ({product.replacementPartsFrom.length})
          </TabsTrigger>
          <TabsTrigger value="chemicals">
            Chemicals ({product.compatibleChemicalsFrom.length})
          </TabsTrigger>
        </TabsList>

        {/* Specs */}
        <TabsContent value="specs">
          {product.specs.length === 0 ? (
            <EmptyTabState
              icon={Package}
              message="No specifications added yet."
              productId={product.id}
            />
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <tbody>
                  {product.specs.map((spec, i) => (
                    <tr
                      key={spec.id}
                      className={i % 2 === 0 ? "bg-muted/30" : "bg-background"}
                    >
                      <td className="px-4 py-3 font-medium w-1/3 text-muted-foreground">
                        {spec.specKey}
                      </td>
                      <td className="px-4 py-3">
                        {spec.specValue}
                        {spec.unit && (
                          <span className="text-muted-foreground ml-1">
                            {spec.unit}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        {/* Maintenance */}
        <TabsContent value="maintenance">
          {product.maintenanceSchedules.length === 0 ? (
            <EmptyTabState
              icon={Wrench}
              message="No maintenance schedule added yet."
              productId={product.id}
            />
          ) : (
            <div className="space-y-3">
              {product.maintenanceSchedules.map((task) => (
                <div
                  key={task.id}
                  className="rounded-lg border p-4 flex items-start gap-4"
                >
                  <div className="bg-blue-100 text-blue-700 rounded-lg px-3 py-2 text-center shrink-0 min-w-[80px]">
                    <p className="text-lg font-bold leading-tight">
                      {task.intervalValue}
                    </p>
                    <p className="text-xs">{task.intervalUnit}</p>
                  </div>
                  <div>
                    <p className="font-medium">{task.taskName}</p>
                    {task.notes && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {task.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Documents */}
        <TabsContent value="documents">
          {product.documents.length === 0 ? (
            <EmptyTabState
              icon={FileText}
              message="No documents added yet."
              productId={product.id}
            />
          ) : (
            <div className="space-y-2">
              {product.documents.map((doc) => (
                <a
                  key={doc.id}
                  href={doc.fileUrl ?? doc.externalUrl ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-lg border p-3 hover:border-blue-400 hover:bg-muted/30 transition-all group"
                >
                  <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{doc.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {doc.type.replace(/_/g, " ")}
                    </p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-blue-600 shrink-0" />
                </a>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Compatible Parts */}
        <TabsContent value="parts">
          {product.replacementPartsFrom.length === 0 ? (
            <EmptyTabState
              icon={Package}
              message="No compatible parts listed yet."
              productId={product.id}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {product.replacementPartsFrom.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/products/${rel.compatibleProduct.id}`}
                  className="rounded-lg border p-3 hover:border-blue-400 transition-all group flex gap-3"
                >
                  <div className="w-12 h-12 bg-muted/50 rounded shrink-0 flex items-center justify-center overflow-hidden">
                    {rel.compatibleProduct.images[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={rel.compatibleProduct.images[0].url}
                        alt=""
                        className="w-full h-full object-contain p-1"
                      />
                    ) : (
                      <Package className="h-5 w-5 text-muted-foreground/40" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm group-hover:text-blue-600 truncate">
                      {rel.compatibleProduct.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {rel.compatibleProduct.brand.name}
                    </p>
                    {rel.notes && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {rel.notes}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Compatible Chemicals */}
        <TabsContent value="chemicals">
          {product.compatibleChemicalsFrom.length === 0 ? (
            <EmptyTabState
              icon={Beaker}
              message="No compatible chemicals listed yet."
              productId={product.id}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {product.compatibleChemicalsFrom.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/products/${rel.chemicalProduct.id}`}
                  className="rounded-lg border p-3 hover:border-blue-400 transition-all group flex gap-3"
                >
                  <div className="w-12 h-12 bg-muted/50 rounded shrink-0 flex items-center justify-center">
                    <Beaker className="h-5 w-5 text-muted-foreground/40" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm group-hover:text-blue-600 truncate">
                      {rel.chemicalProduct.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {rel.chemicalProduct.brand.name}
                    </p>
                    {rel.notes && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {rel.notes}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EmptyTabState({
  icon: Icon,
  message,
  productId,
}: {
  icon: React.ComponentType<{ className?: string }>;
  message: string;
  productId: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center gap-2 text-muted-foreground">
      <Icon className="h-8 w-8 opacity-30" />
      <p className="text-sm">{message}</p>
      <ButtonLink variant="outline" size="sm" href={`/products/${productId}/suggest-edit`}>
        Suggest data
      </ButtonLink>
    </div>
  );
}
