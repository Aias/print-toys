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
