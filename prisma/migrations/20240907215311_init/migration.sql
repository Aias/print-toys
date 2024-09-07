-- CreateTable
CREATE TABLE "PrintJob" (
    "jobId" TEXT NOT NULL PRIMARY KEY,
    "escPosCommands" BLOB NOT NULL,
    "printed" BOOLEAN NOT NULL DEFAULT false,
    "submitted" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
