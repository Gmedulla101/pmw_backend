/*
  Warnings:

  - You are about to drop the column `confirmed` on the `UserConfirmation` table. All the data in the column will be lost.
  - You are about to drop the column `userEmail` on the `UserConfirmation` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `UserConfirmation` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `UserConfirmation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "UserConfirmation" DROP CONSTRAINT "UserConfirmation_userEmail_fkey";

-- DropIndex
DROP INDEX "UserConfirmation_userEmail_key";

-- AlterTable
ALTER TABLE "UserConfirmation" DROP COLUMN "confirmed",
DROP COLUMN "userEmail",
ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "UserConfirmation_userId_key" ON "UserConfirmation"("userId");

-- AddForeignKey
ALTER TABLE "UserConfirmation" ADD CONSTRAINT "UserConfirmation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
