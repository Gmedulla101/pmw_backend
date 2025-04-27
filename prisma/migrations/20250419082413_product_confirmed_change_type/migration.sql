-- AlterTable
ALTER TABLE "Transactions" ALTER COLUMN "productConfirmed" SET DEFAULT 'pending',
ALTER COLUMN "productConfirmed" SET DATA TYPE TEXT;
