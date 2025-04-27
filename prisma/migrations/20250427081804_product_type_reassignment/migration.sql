/*
  Warnings:

  - The `productConfirmed` column on the `Transactions` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Transactions" DROP COLUMN "productConfirmed",
ADD COLUMN     "productConfirmed" BOOLEAN NOT NULL DEFAULT false;
