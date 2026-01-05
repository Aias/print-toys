# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

print-toys is a React Router v7-based web application for printing to an Epson TM-T88VI thermal printer via USB. The system receives print requests via a web interface and immediately prints them. Jobs are logged in PostgreSQL for history and audit purposes.

## Essential Commands

```bash
# Development
pnpm dev                    # Start dev server with --host flag (accessible on local network)
pnpm build                  # Build for production

# Code Quality
pnpm typecheck              # Run TypeScript type checking
pnpm lint                   # Run ESLint
pnpm format                 # Format code with Prettier + Tailwind class sorting
pnpm format:check           # Check formatting without modifying files

# Database
pnpm prisma db push         # Push schema changes to database (for development)
pnpm prisma migrate dev     # Create and apply migrations (for production)
pnpm prisma:studio          # Open Prisma Studio GUI
pnpm prisma generate        # Generate Prisma Client
```

## Architecture

### Print Job Flow

1. **Job Submission**: User submits content via web interface (markdown, images, etc.)
2. **Conversion**: Content is converted to ESC/POS commands via `@point-of-sale/receipt-printer-encoder`
3. **Database Write**: Binary ESC/POS commands stored as `Bytes` in PostgreSQL `PrintJob` table
4. **Immediate Printing**: Job is immediately sent to USB printer in background (non-blocking)
5. **Result Tracking**: Job marked as printed with `printedAt` timestamp; failures logged server-side

### Key Architectural Components

**Database Layer** (`prisma/schema.prisma`, `prisma.config.ts`, `app/api/requests.ts`):

- **Prisma 7 with PostgreSQL adapter**: Uses `@prisma/adapter-pg` for database connections
- **Generated client location**: `./generated/prisma/client` (not in node_modules)
- `PrintJob`: Stores binary ESC/POS commands as `Uint8Array` (Prisma 7 changed from Buffer)
  - `printed`: Boolean flag indicating if job has been printed
  - `printedAt`: Timestamp when job was successfully printed (null if pending/failed)
  - `submitted`: Timestamp when job was created
- Uses local PostgreSQL database with adapter pattern
- **Event-driven printing**: `createAndPrintJob()` writes to DB then immediately prints via USB in background

**ESC/POS Generation** (`app/lib/`):

- `encoder.ts`: Configures receipt-printer-encoder for Epson TM-T88VI
- `html-to-esc-pos.ts`: Converts HTML/markdown to ESC/POS via cheerio DOM traversal
- `markdown.ts`: Converts markdown to HTML using `marked`
- `image-processing.ts`: Processes images for thermal printing using `canvas`

**USB Printing** (`app/lib/helpers.ts`):

- `sendToPrinter()`: Sends ESC/POS commands directly to USB printer
- Uses `usb` library with libusb for direct device communication
- Vendor ID: `0x04b8` (Seiko Epson Corp.), Product ID: `0x0202` (TM-T88VI)

**Routes Structure**:

- Routes configured in `app/routes.ts` with explicit route definitions
- Action-only routes prefixed with `actions.` (e.g., `actions.print-markdown.ts`)
- UI routes like `typewriter.tsx`, `notetaker.tsx` provide different print interfaces

### Data Flow Diagram

```
User Interface → Markdown/HTML → ESC/POS Binary → PostgreSQL (audit log)
                                        ↓
                                  [Immediate background print]
                                        ↓
                                   USB Printer
                                        ↓
                              Mark as printed + timestamp
```

## Important Technical Details

**Binary Data Handling**: ESC/POS commands are stored as PostgreSQL `Bytes` type as `Uint8Array`. Prisma 7 uses `Uint8Array` natively (changed from Buffer in Prisma 5/6). The encoder library returns `Uint8Array` directly.

**Codepage Selection**: The encoder uses `codepage("auto")` but supports 40+ codepages (see `supportedCodePages` in `encoder.ts`). Default is PC437.

**Image Processing**: Images are processed through `canvas` library for dithering (Floyd-Steinberg) before thermal printing. Both URL and base64 data URIs are supported.

**Event-Driven Printing**: Jobs print immediately when submitted via web UI using `createAndPrintJob()` which writes to DB then sends to USB printer in background (non-blocking). Print failures are logged server-side; jobs remain in queue for manual retry via `process-usb-queue.ts`.

**Recovery Tool**: `process-usb-queue.ts` is available for manual processing of failed jobs or batch printing of pending jobs. Run with `npx tsx process-usb-queue.ts` or `--watch` flag for continuous polling.

## Environment Variables

Required in `.env`:

- `POSTGRES_PRISMA_URL`: PostgreSQL connection string for Prisma (e.g., `postgresql://username@localhost:5432/print-toys`)
  - Used by `prisma.config.ts` for migrations and schema operations
  - Also passed to `@prisma/adapter-pg` for runtime connections

## Database Setup (Prisma 7)

The project uses Prisma 7 with the PostgreSQL adapter pattern:

```bash
# Create database
psql postgres -c "CREATE DATABASE \"print-toys\";"

# Push schema (development)
pnpm prisma db push

# Generate Prisma Client
pnpm prisma generate

# View data in GUI (optional)
pnpm prisma:studio
```

**Prisma 7 Changes**:

- Client generated to `./generated/prisma` instead of `node_modules`
- Requires `@prisma/adapter-pg` for PostgreSQL connections
- Configuration split between `schema.prisma` and `prisma.config.ts`
- `Bytes` fields are `Uint8Array` (not Buffer)
- Must import `dotenv/config` in `prisma.config.ts`

## Development Notes

- **Node.js >=22.0.0 required** (Vite 7 requirement)
- Uses `pnpm` as package manager (specified in `packageManager` field)
- Dev server uses `--host` flag to be accessible on local network (e.g., from phone via Tailscale)
- **USB Printing**: Uses `usb` library for direct USB communication (TM-T88VI vendor ID `0x04b8`, product ID `0x0202`)
  - Native modules (`usb`, `canvas`) require compilation on first install
  - Test with: `npx tsx test-usb-print.ts`
- **Character Encoding**: Printers use legacy codepages (CP437, Windows-1252), not full Unicode. Stick to ASCII for reliable output.
- **Code Quality Tools**:
  - **Prettier 3.7.4**: Automatic code formatting with standard configuration
  - **prettier-plugin-tailwindcss 0.7.2**: Sorts Tailwind classes automatically
  - **ESLint 9**: Configured with TypeScript, React, and import rules
  - `.prettierignore` is minimal since Prettier respects `.gitignore` automatically
- **React 19**: Uses new ref forwarding (no `forwardRef` needed)
- **React Router v7**: Explicit route configuration in `app/routes.ts`
  - All types imported from `react-router` package
  - Entry files use `HydratedRouter` (client) and `ServerRouter` (server) components
- **Vite 7**: Major performance improvements, updated browser targets (Chrome 107+, Safari 16+, Firefox 104+)
- **Tailwind CSS 4**: Uses `@import "tailwindcss"` syntax and CSS-based `@theme` configuration
- **Prisma 7**: ESM-only, adapter pattern for database connections, generated client in `./generated/prisma`

## Major Stack Versions

- React 19.2.3
- React Router 7.11.0
- Vite 7.3.0
- Tailwind CSS 4.1.18
- Prisma ORM 7.2.0
- TypeScript 5.9.3
- Node.js 22+
