-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_models" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "uid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "prompt" TEXT,
    "status" TEXT NOT NULL,
    "baseModel" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "models_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_models" ("id", "uid", "name", "status", "baseModel", "userId", "createdAt", "updatedAt")
SELECT "id", lower(hex(randomblob(16))), "name", "status", "baseModel", "userId", "createdAt", "updatedAt" FROM "models";
DROP TABLE "models";
ALTER TABLE "new_models" RENAME TO "models";
CREATE UNIQUE INDEX "models_uid_key" ON "models"("uid");
CREATE INDEX "models_userId_idx" ON "models"("userId");
CREATE INDEX "models_uid_idx" ON "models"("uid");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
