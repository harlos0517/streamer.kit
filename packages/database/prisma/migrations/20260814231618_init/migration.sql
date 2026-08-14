-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('TWITCH', 'YOUTUBE');

-- CreateTable
CREATE TABLE "viewers" (
    "id" TEXT NOT NULL,
    "displayName" TEXT,
    "avatarUrl" TEXT,
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastMessageAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "viewers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "identities" (
    "id" TEXT NOT NULL,
    "platform" "Platform" NOT NULL,
    "platformUserId" TEXT NOT NULL,
    "platformDisplayName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "viewerId" TEXT NOT NULL,

    CONSTRAINT "identities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "currencies" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "currencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallets" (
    "id" TEXT NOT NULL,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "viewerId" TEXT NOT NULL,
    "currencyId" TEXT NOT NULL,

    CONSTRAINT "wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "source" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "viewerId" TEXT NOT NULL,
    "currencyId" TEXT NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "identities_viewerId_idx" ON "identities"("viewerId");

-- CreateIndex
CREATE UNIQUE INDEX "identities_platform_platformUserId_key" ON "identities"("platform", "platformUserId");

-- CreateIndex
CREATE UNIQUE INDEX "currencies_key_key" ON "currencies"("key");

-- CreateIndex
CREATE UNIQUE INDEX "wallets_viewerId_currencyId_key" ON "wallets"("viewerId", "currencyId");

-- CreateIndex
CREATE INDEX "transactions_viewerId_idx" ON "transactions"("viewerId");

-- CreateIndex
CREATE INDEX "transactions_currencyId_idx" ON "transactions"("currencyId");

-- AddForeignKey
ALTER TABLE "identities" ADD CONSTRAINT "identities_viewerId_fkey" FOREIGN KEY ("viewerId") REFERENCES "viewers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_viewerId_fkey" FOREIGN KEY ("viewerId") REFERENCES "viewers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "currencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_viewerId_fkey" FOREIGN KEY ("viewerId") REFERENCES "viewers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "currencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
