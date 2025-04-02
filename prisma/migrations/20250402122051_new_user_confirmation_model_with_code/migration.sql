/*
  Warnings:

  - Added the required column `confirmationCode` to the `UserConfirmation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserConfirmation" ADD COLUMN     "confirmationCode" INTEGER NOT NULL;
