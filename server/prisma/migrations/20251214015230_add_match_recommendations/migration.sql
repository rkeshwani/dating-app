-- AlterTable
ALTER TABLE "User" ADD COLUMN "latitude" REAL;
ALTER TABLE "User" ADD COLUMN "longitude" REAL;

-- CreateTable
CREATE TABLE "MatchRecommendation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sourceUserId" TEXT NOT NULL,
    "targetUserId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "algorithm" TEXT NOT NULL,
    "reasoning" TEXT NOT NULL,
    "matchFactors" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MatchRecommendation_sourceUserId_fkey" FOREIGN KEY ("sourceUserId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MatchRecommendation_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "MatchRecommendation_sourceUserId_idx" ON "MatchRecommendation"("sourceUserId");

-- CreateIndex
CREATE INDEX "MatchRecommendation_algorithm_idx" ON "MatchRecommendation"("algorithm");

-- CreateIndex
CREATE UNIQUE INDEX "MatchRecommendation_sourceUserId_targetUserId_algorithm_key" ON "MatchRecommendation"("sourceUserId", "targetUserId", "algorithm");
