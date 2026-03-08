-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('ACTIVE', 'DISCONTINUED', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('MANUAL', 'SPEC_SHEET', 'WARRANTY', 'INSTALLATION_GUIDE', 'PARTS_LIST', 'OTHER');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'CONTRIBUTOR', 'VIEWER');

-- CreateEnum
CREATE TYPE "EditStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "Manufacturer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "website" TEXT,
    "country" TEXT,
    "logoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Manufacturer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Brand" (
    "id" TEXT NOT NULL,
    "manufacturerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "parentId" TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "modelNumber" TEXT,
    "upc" TEXT,
    "sku" TEXT,
    "description" TEXT,
    "status" "ProductStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductSpec" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "specKey" TEXT NOT NULL,
    "specValue" TEXT NOT NULL,
    "unit" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProductSpec_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenanceSchedule" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "taskName" TEXT NOT NULL,
    "intervalValue" INTEGER NOT NULL,
    "intervalUnit" TEXT NOT NULL,
    "notes" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "MaintenanceSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "title" TEXT NOT NULL,
    "fileUrl" TEXT,
    "externalUrl" TEXT,
    "uploadedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductImage" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "altText" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProductImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReplacementPart" (
    "id" TEXT NOT NULL,
    "sourceProductId" TEXT NOT NULL,
    "compatibleProductId" TEXT NOT NULL,
    "notes" TEXT,

    CONSTRAINT "ReplacementPart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompatibleChemical" (
    "id" TEXT NOT NULL,
    "sourceProductId" TEXT NOT NULL,
    "chemicalProductId" TEXT NOT NULL,
    "notes" TEXT,

    CONSTRAINT "CompatibleChemical_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'CONTRIBUTOR',
    "apiKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PendingEdit" (
    "id" TEXT NOT NULL,
    "productId" TEXT,
    "submittedById" TEXT NOT NULL,
    "fieldChanges" JSONB NOT NULL,
    "status" "EditStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PendingEdit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EditHistory" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "changedById" TEXT NOT NULL,
    "fieldChanges" JSONB NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EditHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Manufacturer_name_key" ON "Manufacturer"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Brand_manufacturerId_name_key" ON "Brand"("manufacturerId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Product_upc_key" ON "Product"("upc");

-- CreateIndex
CREATE INDEX "Product_brandId_idx" ON "Product"("brandId");

-- CreateIndex
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");

-- CreateIndex
CREATE INDEX "Product_upc_idx" ON "Product"("upc");

-- CreateIndex
CREATE INDEX "Product_modelNumber_idx" ON "Product"("modelNumber");

-- CreateIndex
CREATE INDEX "ProductSpec_productId_idx" ON "ProductSpec"("productId");

-- CreateIndex
CREATE INDEX "MaintenanceSchedule_productId_idx" ON "MaintenanceSchedule"("productId");

-- CreateIndex
CREATE INDEX "Document_productId_idx" ON "Document"("productId");

-- CreateIndex
CREATE INDEX "ProductImage_productId_idx" ON "ProductImage"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "ReplacementPart_sourceProductId_compatibleProductId_key" ON "ReplacementPart"("sourceProductId", "compatibleProductId");

-- CreateIndex
CREATE UNIQUE INDEX "CompatibleChemical_sourceProductId_chemicalProductId_key" ON "CompatibleChemical"("sourceProductId", "chemicalProductId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_apiKey_key" ON "User"("apiKey");

-- CreateIndex
CREATE INDEX "PendingEdit_status_idx" ON "PendingEdit"("status");

-- CreateIndex
CREATE INDEX "PendingEdit_productId_idx" ON "PendingEdit"("productId");

-- CreateIndex
CREATE INDEX "EditHistory_productId_idx" ON "EditHistory"("productId");

-- AddForeignKey
ALTER TABLE "Brand" ADD CONSTRAINT "Brand_manufacturerId_fkey" FOREIGN KEY ("manufacturerId") REFERENCES "Manufacturer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductSpec" ADD CONSTRAINT "ProductSpec_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceSchedule" ADD CONSTRAINT "MaintenanceSchedule_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReplacementPart" ADD CONSTRAINT "ReplacementPart_sourceProductId_fkey" FOREIGN KEY ("sourceProductId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReplacementPart" ADD CONSTRAINT "ReplacementPart_compatibleProductId_fkey" FOREIGN KEY ("compatibleProductId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompatibleChemical" ADD CONSTRAINT "CompatibleChemical_sourceProductId_fkey" FOREIGN KEY ("sourceProductId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompatibleChemical" ADD CONSTRAINT "CompatibleChemical_chemicalProductId_fkey" FOREIGN KEY ("chemicalProductId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PendingEdit" ADD CONSTRAINT "PendingEdit_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PendingEdit" ADD CONSTRAINT "PendingEdit_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PendingEdit" ADD CONSTRAINT "PendingEdit_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EditHistory" ADD CONSTRAINT "EditHistory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EditHistory" ADD CONSTRAINT "EditHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
