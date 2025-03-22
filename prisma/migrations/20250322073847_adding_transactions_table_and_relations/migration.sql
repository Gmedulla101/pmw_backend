-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "Transactions" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,

    CONSTRAINT "Transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Transactions_sellerId_key" ON "Transactions"("sellerId");

-- CreateIndex
CREATE UNIQUE INDEX "Transactions_buyerId_key" ON "Transactions"("buyerId");

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
