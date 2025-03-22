/*
  Warnings:

  - Added the required column `txnItem` to the `Transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `txnItemCategory` to the `Transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `txnItemValue` to the `Transactions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Transactions" ADD COLUMN     "txnItem" TEXT NOT NULL,
ADD COLUMN     "txnItemCategory" TEXT NOT NULL,
ADD COLUMN     "txnItemValue" INTEGER NOT NULL;
