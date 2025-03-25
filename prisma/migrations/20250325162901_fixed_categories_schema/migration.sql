/*
  Warnings:

  - You are about to drop the column `txnItemCategory` on the `Transactions` table. All the data in the column will be lost.
  - Added the required column `txnItemCategoryId` to the `Transactions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Transactions" DROP CONSTRAINT "Transactions_txnItemCategory_fkey";

-- AlterTable
ALTER TABLE "Transactions" DROP COLUMN "txnItemCategory",
ADD COLUMN     "txnItemCategoryId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_txnItemCategoryId_fkey" FOREIGN KEY ("txnItemCategoryId") REFERENCES "Categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
