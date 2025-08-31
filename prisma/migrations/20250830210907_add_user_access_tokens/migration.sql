/*
  Warnings:

  - A unique constraint covering the columns `[accessToken]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN "accessToken" TEXT;
ALTER TABLE "users" ADD COLUMN "tokenExpiresAt" DATETIME;

-- CreateIndex
CREATE UNIQUE INDEX "users_accessToken_key" ON "users"("accessToken");
