/*
  Warnings:

  - You are about to drop the column `middleName` on the `Users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Users" DROP COLUMN "middleName",
ADD COLUMN     "profilePic" TEXT NOT NULL DEFAULT 'http://militaryhealthinstitute.org/wp-content/uploads/sites/37/2021/08/blank-profile-picture-png.png';
