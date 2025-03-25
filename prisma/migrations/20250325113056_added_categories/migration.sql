-- CreateTable
CREATE TABLE "Categories" (
    "id" TEXT NOT NULL,
    "categoryName" TEXT NOT NULL,
    "categoryTransactions" TEXT[],

    CONSTRAINT "Categories_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_txnItemCategory_fkey" FOREIGN KEY ("txnItemCategory") REFERENCES "Categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
