/*
  Warnings:

  - You are about to drop the column `categoryTransactions` on the `Categories` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[categoryName]` on the table `Categories` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Categories" DROP COLUMN "categoryTransactions";

-- CreateIndex
CREATE UNIQUE INDEX "Categories_categoryName_key" ON "Categories"("categoryName");
