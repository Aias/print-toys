# print-toys

Print Toys is An exploratory playground for integrating a web front-end and Node environment with Epson thermal printers. Specifically, I'm working with the Epson TM-T88VI. The goal is to develop a framework for sending and scheduling print jobs remotely to the printer, even when I'm not connected to the local network.

**NOTE:** When I say _playground_, I mean it. Significant portions of the code in this repo are AI-generated. Many of the technologies used are unfamiliar to me and I'm basically just hacking it all together from poorly-written user manuals. Exercise caution when using, modifying, or attempting to deploy any part of this codebase in your own environment.

## Features

- Queue management for print jobs
- XML-based communication with Epson printers
- ESC/POS command generation and processing
- Configuration management for print settings
- Modern React 19 UI with shadcn/ui components (Base UI primitives)

## Setup

The following setup assumes you have an Epson TM-T88VI printer already set up and connected via ethernet to your local network. Setup steps may be similar for other models, but at a minimum the printer should support Server Direct Printing for connecting to a remote host.

### Prerequisites

- **Node.js >=22.0.0** (required for Vite 7)
- **PostgreSQL** running locally
- **pnpm** package manager (v10.24.0+)
- Modern browser (Chrome 107+, Safari 16+, Firefox 104+ for Tailwind CSS 4)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/print-toys.git
   cd print-toys
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Create local PostgreSQL database:

   ```bash
   psql postgres -c "CREATE DATABASE \"print-toys\";"
   ```

4. Configure environment variables in `.env`:

   ```bash
   POSTGRES_PRISMA_URL="postgresql://yourusername@localhost:5432/print-toys"
   ```

5. Push Prisma schema to database:

   ```bash
   pnpm prisma db push
   ```

6. Start the development server:

   ```bash
   pnpm dev
   ```

7. Get the local network address of your server and use the Epson configuration app or the web admin interface to point Server Direct Print to `http://<network-address>:<port>/queue`.

## Usage

After setting up the project, you can access the various utilities through the web interface. The main entry point for print job management is the `/queue` route.

## Code Quality

This project uses several tools to maintain code quality:

### Linting

```bash
pnpm lint          # Run ESLint
```

The project uses ESLint 9 with TypeScript, React, JSX accessibility, and import plugins configured.

### Formatting

```bash
pnpm format        # Format all files with Prettier
pnpm format:check  # Check formatting without modifying files
```

Prettier 3.7.4 is configured with standard settings:

- 80 character line width
- 2 space indentation
- Semicolons, double quotes, trailing commas
- LF line endings
- **Automatic Tailwind CSS class sorting** via `prettier-plugin-tailwindcss`

Prettier automatically respects `.gitignore`, so most generated files and build artifacts are excluded by default.

### Type Checking

```bash
pnpm typecheck     # Run TypeScript compiler
```

## UI Components

The project uses **shadcn/ui** with **Base UI** primitives (`@base-ui/react`) for accessible, unstyled UI components. The style preset is "base-lyra" with OKLCH colors and automatic light/dark theme support.

### Adding Components

To add new shadcn components:

```bash
pnpx shadcn add <component-name>
```

Examples:
- `pnpx shadcn add button`
- `pnpx shadcn add card`
- `pnpx shadcn add input`

Components are installed to `app/components/ui/` and use:
- **Base UI primitives** instead of Radix UI
- **Lucide icons** for icon components
- **Data attributes** for styling (e.g., `data-slot`, `data-size`)
- **No `forwardRef`** (React 19 auto-forwards refs)
- **No `asChild` prop** on Button component
