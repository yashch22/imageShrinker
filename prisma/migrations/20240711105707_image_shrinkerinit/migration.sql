-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "serialNumber" INTEGER NOT NULL,
    "productName" TEXT NOT NULL,
    "inputImageUrls" TEXT NOT NULL,
    "outputImageUrls" TEXT,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Request" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Request_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_serialNumber_key" ON "Product"("serialNumber");
