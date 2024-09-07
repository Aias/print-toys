-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PrintJob" (
    "jobId" TEXT NOT NULL PRIMARY KEY,
    "escPosCommands" BLOB NOT NULL,
    "printed" BOOLEAN NOT NULL DEFAULT false,
    "submitted" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cutAfterPrint" BOOLEAN NOT NULL DEFAULT true
);
INSERT INTO "new_PrintJob" ("escPosCommands", "jobId", "printed", "submitted") SELECT "escPosCommands", "jobId", "printed", "submitted" FROM "PrintJob";
DROP TABLE "PrintJob";
ALTER TABLE "new_PrintJob" RENAME TO "PrintJob";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
