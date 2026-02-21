/*
  Warnings:

  - You are about to drop the `FAQ` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `text` on the `ChatMessage` table. All the data in the column will be lost.
  - You are about to drop the column `text` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `text` on the `Feedback` table. All the data in the column will be lost.
  - You are about to drop the column `agreedAt` on the `LegalConsent` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `Lesson` table. All the data in the column will be lost.
  - You are about to drop the column `isFree` on the `Lesson` table. All the data in the column will be lost.
  - You are about to drop the column `videoUrl` on the `Lesson` table. All the data in the column will be lost.
  - You are about to drop the column `position` on the `VideoProgress` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `VideoProgress` table. All the data in the column will be lost.
  - Added the required column `message` to the `ChatMessage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ChatMessage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `content` to the `Comment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `message` to the `Feedback` table without a default value. This is not possible if the table is not empty.
  - Added the required column `consentType` to the `LegalConsent` table without a default value. This is not possible if the table is not empty.
  - Made the column `email` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `progress` to the `VideoProgress` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Subscription_endsAt_idx";

-- DropIndex
DROP INDEX "Subscription_courseId_idx";

-- DropIndex
DROP INDEX "Subscription_userId_idx";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "FAQ";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "CourseChat" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "courseId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CourseChat_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CourseChat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VideoComment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lessonId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "timestamp" INTEGER,
    "parentId" TEXT,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "VideoComment_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "VideoComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "VideoComment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "VideoComment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EnhancedVideoProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "progress" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "lastWatched" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "preferredQuality" TEXT NOT NULL DEFAULT 'AUTO',
    "preferredSpeed" REAL NOT NULL DEFAULT 1.0,
    "preferredAudio" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EnhancedVideoProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EnhancedVideoProgress_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ChatMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "courseId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ChatMessage_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ChatMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ChatMessage" ("courseId", "createdAt", "id", "userId") SELECT "courseId", "createdAt", "id", "userId" FROM "ChatMessage";
DROP TABLE "ChatMessage";
ALTER TABLE "new_ChatMessage" RENAME TO "ChatMessage";
CREATE INDEX "ChatMessage_courseId_createdAt_idx" ON "ChatMessage"("courseId", "createdAt");
CREATE TABLE "new_Comment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lessonId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Comment_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Comment" ("createdAt", "id", "lessonId", "updatedAt", "userId") SELECT "createdAt", "id", "lessonId", "updatedAt", "userId" FROM "Comment";
DROP TABLE "Comment";
ALTER TABLE "new_Comment" RENAME TO "Comment";
CREATE INDEX "Comment_lessonId_idx" ON "Comment"("lessonId");
CREATE TABLE "new_Feedback" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "rating" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Feedback" ("createdAt", "id", "rating", "userId") SELECT "createdAt", "id", "rating", "userId" FROM "Feedback";
DROP TABLE "Feedback";
ALTER TABLE "new_Feedback" RENAME TO "Feedback";
CREATE TABLE "new_LegalConsent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "consentType" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "consentedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip" TEXT,
    "userAgent" TEXT,
    CONSTRAINT "LegalConsent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_LegalConsent" ("id", "ip", "userAgent", "userId", "version") SELECT "id", "ip", "userAgent", "userId", "version" FROM "LegalConsent";
DROP TABLE "LegalConsent";
ALTER TABLE "new_LegalConsent" RENAME TO "LegalConsent";
CREATE INDEX "LegalConsent_userId_idx" ON "LegalConsent"("userId");
CREATE UNIQUE INDEX "LegalConsent_userId_consentType_version_key" ON "LegalConsent"("userId", "consentType", "version");
CREATE TABLE "new_Lesson" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "courseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleRu" TEXT,
    "description" TEXT,
    "descriptionRu" TEXT,
    "order" INTEGER NOT NULL,
    "content" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Lesson_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Lesson" ("content", "courseId", "createdAt", "description", "id", "order", "title", "updatedAt") SELECT "content", "courseId", "createdAt", "description", "id", "order", "title", "updatedAt" FROM "Lesson";
DROP TABLE "Lesson";
ALTER TABLE "new_Lesson" RENAME TO "Lesson";
CREATE TABLE "new_Like" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lessonId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Like_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Like_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Like" ("createdAt", "id", "lessonId", "userId") SELECT "createdAt", "id", "lessonId", "userId" FROM "Like";
DROP TABLE "Like";
ALTER TABLE "new_Like" RENAME TO "Like";
CREATE UNIQUE INDEX "Like_lessonId_userId_key" ON "Like"("lessonId", "userId");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "telegramId" TEXT,
    "password" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("createdAt", "email", "firstName", "id", "lastName", "password", "phone", "role", "telegramId", "updatedAt") SELECT "createdAt", "email", "firstName", "id", "lastName", "password", "phone", "role", "telegramId", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");
CREATE UNIQUE INDEX "User_telegramId_key" ON "User"("telegramId");
CREATE TABLE "new_VideoProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "progress" INTEGER NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "lastWatched" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VideoProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "VideoProgress_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_VideoProgress" ("completed", "id", "lessonId", "userId") SELECT "completed", "id", "lessonId", "userId" FROM "VideoProgress";
DROP TABLE "VideoProgress";
ALTER TABLE "new_VideoProgress" RENAME TO "VideoProgress";
CREATE UNIQUE INDEX "VideoProgress_userId_lessonId_key" ON "VideoProgress"("userId", "lessonId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "CourseChat_courseId_createdAt_idx" ON "CourseChat"("courseId", "createdAt");

-- CreateIndex
CREATE INDEX "VideoComment_lessonId_createdAt_idx" ON "VideoComment"("lessonId", "createdAt");

-- CreateIndex
CREATE INDEX "VideoComment_parentId_idx" ON "VideoComment"("parentId");

-- CreateIndex
CREATE INDEX "EnhancedVideoProgress_userId_lastWatched_idx" ON "EnhancedVideoProgress"("userId", "lastWatched");

-- CreateIndex
CREATE UNIQUE INDEX "EnhancedVideoProgress_userId_lessonId_key" ON "EnhancedVideoProgress"("userId", "lessonId");
