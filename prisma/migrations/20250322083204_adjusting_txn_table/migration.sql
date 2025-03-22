-- DropForeignKey
ALTER TABLE "Transactions" DROP CONSTRAINT "Transactions_buyerId_fkey";

-- DropForeignKey
ALTER TABLE "Transactions" DROP CONSTRAINT "Transactions_sellerId_fkey";

-- AlterTable
ALTER TABLE "Transactions" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pending',
ALTER COLUMN "sellerId" DROP NOT NULL,
ALTER COLUMN "buyerId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
