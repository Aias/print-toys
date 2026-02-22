# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Documentation Maintenance

**Important**: When the user refers to "the docs", this typically means both `README.md` and `CLAUDE.md`. These files serve different audiences but must be kept in sync as the application evolves:

- **README.md**: User-facing documentation for setup, usage, and features
- **CLAUDE.md**: Technical reference for AI assistants with architecture details and development notes

Not every change requires updating both files - keep each targeted for its specific use case. However, both should be continuously maintained to reflect the current state of the application.

## Project Overview

print-toys is a Next.js 16-based web application for printing to an Epson TM-T88VI thermal printer via USB. The system receives print requests via a web interface and immediately prints them using Server Actions and the after() API. Jobs are logged in PostgreSQL for history and audit purposes.

## Essential Commands

```bash
# Development
pnpm dev                    # Start dev server with --host flag (accessible on local network)

# Production
pnpm build                  # Build for production
pnpm start                  # Start production server on port 3030

# pm2 (process management)
pm2 start ecosystem.config.cjs  # Start with pm2 for auto-restart and boot persistence
pm2 logs print-toys             # View application logs
pm2 restart print-toys          # Restart the application

# Code Quality
pnpm check                  # Run all checks (lint + typecheck + format)
pnpm typecheck              # Run type checking (tsgo --noEmit)
pnpm lint                   # Run oxlint with auto-fix and type-aware rules
pnpm lint:check             # Run oxlint without auto-fix (CI mode)
pnpm format                 # Format code with oxfmt (Tailwind class sorting + import sorting)
pnpm format:check           # Check formatting without modifying files

# Database
pnpm prisma db push         # Push schema changes to database (for development)
pnpm prisma migrate dev     # Create and apply migrations (for production)
pnpm prisma:studio          # Open Prisma Studio GUI
pnpm prisma generate        # Generate Prisma Client

# UI Components
pnpx shadcn add <component> # Add shadcn/ui component (e.g., pnpx shadcn add button)
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
- **Event-driven printing**: Server Actions use `after()` API to print in background after DB write

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

- File-based routing in `app/` directory using Next.js 16 App Router
- Server Actions in `app/actions/` for print operations (`print-line.ts`, `print-markdown.ts`, `print-image.ts`)
- UI routes: `page.tsx` files in subdirectories (typewriter, notetaker, print-image)
- Each route has its own `layout.tsx` for metadata and optional `error.tsx` for Error Boundaries

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

**Event-Driven Printing**: Jobs print immediately when submitted via web UI using Server Actions. Each action creates a DB record, then uses the `fireAndForget()` wrapper with Next.js 16's `after()` API to send to USB printer in background (non-blocking). Print failures are logged server-side. Error Boundaries catch and display errors gracefully.

## Environment Variables

Required in `.env`:

- `POSTGRES_PRISMA_URL`: PostgreSQL connection string for Prisma (e.g., `postgresql://username@localhost:5432/print-toys`)
  - Used by `prisma.config.ts` for migrations and schema operations
  - Also passed to `@prisma/adapter-pg` for runtime connections
  - **Production**: Requires `import "dotenv/config"` in `app/api/requests.ts` to load `.env` file (dev mode handles this automatically)

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

- **Node.js >=22.0.0 required** (Next.js 16 requirement)
- Uses `pnpm` as package manager (specified in `packageManager` field)
  - `pnpm-workspace.yaml` configures build dependencies (`onlyBuiltDependencies: [msw]`)
- **Dev server**: Uses `--hostname 0.0.0.0` flag (accessible on local network, port 3000)
- **Production server**: Runs on port 3030 via `next start -p 3030`
- **Process management**: `ecosystem.config.cjs` configures pm2 for auto-restart and boot persistence
  - Uses fork mode (not cluster) for simpler process management
  - Logs stored in `./logs/` directory
  - 512MB memory limit with auto-restart
  - Requires `dotenv/config` import in `app/api/requests.ts` for production env vars
- **Network access**: Accessible via Tailscale for remote printing (e.g., `http://mac-mini:3030` from other devices on tailnet)
- **USB Printing**: Uses `usb` library for direct USB communication (TM-T88VI vendor ID `0x04b8`, product ID `0x0202`)
  - Native modules (`usb`, `canvas`) require compilation on first install
  - Configured via `serverExternalPackages` in `next.config.ts`
- **Character Encoding**: Printers use legacy codepages (CP437, Windows-1252), not full Unicode. Stick to ASCII for reliable output.
- **Code Quality Tools**:
  - **oxfmt 0.34.0**: Code formatting with Tailwind class sorting and import sorting (config: `.oxfmtrc.json`)
  - **oxlint 1.49.0**: Linting with type-aware rules via `oxlint-tsgolint` (config: `oxlint.config.ts`)
  - **tsgo** (via `@typescript/native-preview`): Native TypeScript compiler for type checking
  - `pnpm check` runs all three: lint, typecheck, format
- **React 19**: Uses new ref forwarding (no `forwardRef` needed)
- **Next.js 16**: App Router with file-based routing
  - Server Actions in `app/actions/` with "use server" directive
  - Client Components use "use client" directive
  - Error Boundaries via `error.tsx` files
  - Metadata via exports in `layout.tsx` files
  - Uses `after()` API from `next/server` for fire-and-forget operations
  - Uses tsgo for type checking; tsc available as fallback
- **Tailwind CSS 4**: Uses `@import "tailwindcss"` syntax and CSS-based `@theme` configuration
  - **PostCSS**: Uses `@tailwindcss/postcss` plugin for CSS package imports
  - **shadcn/ui integration**: Imports `shadcn/tailwind.css` and `tw-animate-css` for component styling
  - **OKLCH colors**: All color tokens use OKLCH format with `:root/.dark` pattern (not `light-dark()`)
- **UI Components (shadcn/ui)**:
  - **Base UI primitives**: Uses `@base-ui/react` instead of Radix UI (headless, unstyled primitives)
  - **Style preset**: "base-lyra" style in `components.json` with RSC support enabled
  - **Icon library**: Lucide icons (`lucide` package)
  - Components in `app/components/ui/` follow shadcn conventions with data attributes for styling
  - No `forwardRef` needed (React 19), no `asChild` prop on Button
- **Prisma 7**: ESM-only, adapter pattern for database connections, generated client in `./generated/prisma`

## Major Stack Versions

- React 19.2.3
- Next.js 16.1.1
- Tailwind CSS 4.1.18
- Prisma ORM 7.2.0
- TypeScript 5.9.3 (tsgo via @typescript/native-preview for type checking)
- oxlint 1.49.0 + oxlint-tsgolint 0.14.2
- oxfmt 0.34.0
- Node.js 22+
