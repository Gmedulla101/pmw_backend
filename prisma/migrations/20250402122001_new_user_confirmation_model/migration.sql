-- CreateTable
CREATE TABLE "UserConfirmation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "confirmed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "UserConfirmation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserConfirmation_userId_key" ON "UserConfirmation"("userId");

-- AddForeignKey
ALTER TABLE "UserConfirmation" ADD CONSTRAINT "UserConfirmation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
