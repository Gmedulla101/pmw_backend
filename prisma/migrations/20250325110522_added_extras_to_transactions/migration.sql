-- DropIndex
DROP INDEX "Transactions_buyerId_key";

-- DropIndex
DROP INDEX "Transactions_sellerId_key";

-- AlterTable
ALTER TABLE "Transactions" ADD COLUMN     "cashConfirmed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "productConfirmed" BOOLEAN NOT NULL DEFAULT false;
