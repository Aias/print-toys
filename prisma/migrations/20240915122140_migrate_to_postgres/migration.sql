-- CreateTable
CREATE TABLE "PrintJob" (
    "jobId" TEXT NOT NULL,
    "escPosCommands" BYTEA NOT NULL,
    "printed" BOOLEAN NOT NULL DEFAULT false,
    "submitted" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cutAfterPrint" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "PrintJob_pkey" PRIMARY KEY ("jobId")
);

-- CreateTable
CREATE TABLE "Configuration" (
    "id" SERIAL NOT NULL,
    "queueEnabled" BOOLEAN NOT NULL,
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validTo" TIMESTAMP(3),

    CONSTRAINT "Configuration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrintJobResult" (
    "id" SERIAL NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "serverDirectPrintSuccess" BOOLEAN NOT NULL,
    "fullXml" TEXT NOT NULL,
    "serverDirectPrintErrorSummary" TEXT,
    "serverDirectPrintErrorDetail" TEXT,
    "printerDeviceId" TEXT,
    "printerJobId" TEXT,
    "printerSuccess" BOOLEAN NOT NULL,
    "printerCode" TEXT,
    "printerStatus" TEXT,

    CONSTRAINT "PrintJobResult_pkey" PRIMARY KEY ("id")
);
