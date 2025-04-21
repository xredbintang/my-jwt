-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "latest_access_token" VARCHAR(500) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pelanggan" (
    "pelanggan_id" SERIAL NOT NULL,
    "pelanggan_nama" VARCHAR(150) NOT NULL,
    "pelanggan_alamat" VARCHAR(200) NOT NULL,
    "pelanggan_notelp" CHAR(13) NOT NULL,
    "pelanggan_email" VARCHAR(100) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pelanggan_pkey" PRIMARY KEY ("pelanggan_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Pelanggan_pelanggan_email_key" ON "Pelanggan"("pelanggan_email");
