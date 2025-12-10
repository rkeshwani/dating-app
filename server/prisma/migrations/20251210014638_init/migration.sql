-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "googleId" TEXT,
    "facebookId" TEXT,
    "email" TEXT,
    "name" TEXT,
    "age" INTEGER,
    "gender" TEXT,
    "location" TEXT,
    "jobTitle" TEXT,
    "bio" TEXT,
    "interests" TEXT,
    "lookingForDescription" TEXT,
    "photoUrl" TEXT,
    "interestedIn" TEXT,
    "ageRangeMin" INTEGER,
    "ageRangeMax" INTEGER,
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "User_facebookId_key" ON "User"("facebookId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
