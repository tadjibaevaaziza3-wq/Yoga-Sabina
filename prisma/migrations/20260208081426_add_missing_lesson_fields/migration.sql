-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Lesson" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "courseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleRu" TEXT,
    "description" TEXT,
    "descriptionRu" TEXT,
    "order" INTEGER NOT NULL,
    "duration" INTEGER,
    "isFree" BOOLEAN NOT NULL DEFAULT false,
    "videoUrl" TEXT,
    "content" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Lesson_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Lesson" ("content", "courseId", "createdAt", "description", "descriptionRu", "id", "order", "title", "titleRu", "updatedAt") SELECT "content", "courseId", "createdAt", "description", "descriptionRu", "id", "order", "title", "titleRu", "updatedAt" FROM "Lesson";
DROP TABLE "Lesson";
ALTER TABLE "new_Lesson" RENAME TO "Lesson";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
