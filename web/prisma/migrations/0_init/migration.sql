-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "birthDate" TEXT,
    "birthTime" TEXT,
    "birthTimeKnown" BOOLEAN NOT NULL DEFAULT false,
    "gender" TEXT,
    "accentTint" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Universe" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nameKo" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "icon" TEXT,
    "accentTint" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Universe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Person" (
    "id" TEXT NOT NULL,
    "universeId" TEXT NOT NULL,
    "nameKo" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "relation" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "birthDate" TEXT NOT NULL,
    "birthTime" TEXT,
    "birthTimeKnown" BOOLEAN NOT NULL DEFAULT false,
    "emoji" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Person_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Universe_userId_idx" ON "Universe"("userId");

-- CreateIndex
CREATE INDEX "Person_universeId_idx" ON "Person"("universeId");

-- AddForeignKey
ALTER TABLE "Universe" ADD CONSTRAINT "Universe_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Person" ADD CONSTRAINT "Person_universeId_fkey" FOREIGN KEY ("universeId") REFERENCES "Universe"("id") ON DELETE CASCADE ON UPDATE CASCADE;
