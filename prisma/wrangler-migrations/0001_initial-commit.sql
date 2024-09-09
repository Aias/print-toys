-- CreateTable
CREATE TABLE "PrintJob" (
    "jobId" TEXT NOT NULL PRIMARY KEY,
    "escPosCommands" BLOB NOT NULL,
    "printed" BOOLEAN NOT NULL DEFAULT false,
    "submitted" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cutAfterPrint" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "Configuration" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "queueEnabled" BOOLEAN NOT NULL,
    "validFrom" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validTo" DATETIME
);

-- CreateTable
CREATE TABLE "PrintJobResult" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "serverDirectPrintSuccess" BOOLEAN NOT NULL,
    "fullXml" TEXT NOT NULL,
    "serverDirectPrintErrorSummary" TEXT,
    "serverDirectPrintErrorDetail" TEXT,
    "printerDeviceId" TEXT,
    "printerJobId" TEXT,
    "printerSuccess" BOOLEAN NOT NULL,
    "printerCode" TEXT,
    "printerStatus" TEXT
);
