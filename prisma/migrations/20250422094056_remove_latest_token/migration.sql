/*
  Warnings:

  - You are about to drop the column `latest_access_token` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "latest_access_token";
