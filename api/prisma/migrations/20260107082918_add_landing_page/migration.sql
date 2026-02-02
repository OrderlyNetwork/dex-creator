-- CreateTable
CREATE TABLE "LandingPage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "repoIdentifier" TEXT NOT NULL,
    "repoUrl" TEXT,
    "customDomain" TEXT,
    "htmlContent" TEXT,
    "config" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LandingPage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LandingPage_userId_key" ON "LandingPage"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "LandingPage_repoIdentifier_key" ON "LandingPage"("repoIdentifier");

-- CreateIndex
CREATE INDEX "LandingPage_userId_idx" ON "LandingPage"("userId");

-- AddForeignKey
ALTER TABLE "LandingPage" ADD CONSTRAINT "LandingPage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
