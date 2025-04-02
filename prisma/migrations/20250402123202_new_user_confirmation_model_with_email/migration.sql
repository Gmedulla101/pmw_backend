/*
  Warnings:

  - You are about to drop the column `userId` on the `UserConfirmation` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userEmail]` on the table `UserConfirmation` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userEmail` to the `UserConfirmation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "UserConfirmation" DROP CONSTRAINT "UserConfirmation_userId_fkey";

-- DropIndex
DROP INDEX "UserConfirmation_userId_key";

-- AlterTable
ALTER TABLE "UserConfirmation" DROP COLUMN "userId",
ADD COLUMN     "userEmail" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "UserConfirmation_userEmail_key" ON "UserConfirmation"("userEmail");

-- AddForeignKey
ALTER TABLE "UserConfirmation" ADD CONSTRAINT "UserConfirmation_userEmail_fkey" FOREIGN KEY ("userEmail") REFERENCES "Users"("email") ON DELETE RESTRICT ON UPDATE CASCADE;
