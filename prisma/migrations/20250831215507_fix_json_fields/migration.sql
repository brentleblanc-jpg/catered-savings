-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_analytics_events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventType" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    "retailerId" TEXT,
    "sponsoredProductId" TEXT,
    CONSTRAINT "analytics_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "analytics_events_retailerId_fkey" FOREIGN KEY ("retailerId") REFERENCES "retailers" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "analytics_events_sponsoredProductId_fkey" FOREIGN KEY ("sponsoredProductId") REFERENCES "sponsored_products" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_analytics_events" ("createdAt", "eventType", "id", "ipAddress", "metadata", "retailerId", "sponsoredProductId", "userAgent", "userId") SELECT "createdAt", "eventType", "id", "ipAddress", "metadata", "retailerId", "sponsoredProductId", "userAgent", "userId" FROM "analytics_events";
DROP TABLE "analytics_events";
ALTER TABLE "new_analytics_events" RENAME TO "analytics_events";
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "preferences" TEXT,
    "mailchimpStatus" TEXT NOT NULL DEFAULT 'pending',
    "accessToken" TEXT,
    "tokenExpiresAt" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastActiveAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_users" ("accessToken", "createdAt", "email", "id", "isActive", "lastActiveAt", "mailchimpStatus", "name", "preferences", "tokenExpiresAt", "updatedAt") SELECT "accessToken", "createdAt", "email", "id", "isActive", "lastActiveAt", "mailchimpStatus", "name", "preferences", "tokenExpiresAt", "updatedAt" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "users_accessToken_key" ON "users"("accessToken");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
