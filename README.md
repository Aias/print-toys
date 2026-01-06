# print-toys

Print Toys is an exploratory playground for integrating a web front-end and Node environment with Epson thermal printers. Specifically, I'm working with the Epson TM-T88VI. The goal is to develop a framework for sending print jobs remotely to the printer via USB, accessible over Tailscale when away from the local network.

**NOTE:** When I say _playground_, I mean it. Significant portions of the code in this repo are AI-generated. Many of the technologies used are unfamiliar to me and I'm basically just hacking it all together from poorly-written user manuals. Exercise caution when using, modifying, or attempting to deploy any part of this codebase in your own environment.

## Features

- **Immediate USB printing**: Jobs print instantly when submitted via web UI
- **Multiple print interfaces**: Typewriter, Notetaker (markdown), and Image Printer
- **ESC/POS command generation**: Converts HTML/markdown to thermal printer commands
- **Job history**: PostgreSQL database logs all print jobs for audit purposes
- **Remote access**: Accessible via Tailscale network for printing from anywhere
- **Modern React 19 UI**: Built with shadcn/ui components and Base UI primitives

## Setup

The following setup assumes you have an Epson TM-T88VI printer connected via USB to your development machine. Setup steps may be similar for other Epson thermal printers that support USB communication.

### Prerequisites

- **Node.js >=22.0.0** (required for Vite 7)
- **PostgreSQL** running locally
- **pnpm** package manager (v10.24.0+)
- **Epson TM-T88VI** (or compatible) connected via USB
- Modern browser (Chrome 107+, Safari 16+, Firefox 104+ for Tailwind CSS 4)
- **(Optional) Tailscale** for remote access to the print server

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

   The dev server will be accessible on your local network via the displayed IP address.

7. For production, build and start the server:

   ```bash
   pnpm build
   pnpm start
   ```

   The production server runs on port 3030 by default.

### Production Deployment (pm2)

For persistent operation with auto-restart and startup on boot, use pm2:

1. Install pm2 globally:

   ```bash
   npm install -g pm2
   ```

   (Note: Use npm for global installs, as pnpm requires additional setup for global packages)

2. Start the application:

   ```bash
   pm2 start ecosystem.config.cjs
   ```

3. Save the pm2 process list:

   ```bash
   pm2 save
   ```

4. Configure pm2 to start on boot:

   ```bash
   pm2 startup
   ```

   Follow the instructions provided by the command (usually requires running a generated command with sudo).

5. Useful pm2 commands:

   ```bash
   pm2 status              # View process status
   pm2 logs print-toys     # View application logs
   pm2 restart print-toys  # Restart the application
   pm2 stop print-toys     # Stop the application
   pm2 delete print-toys   # Remove from pm2
   ```

Logs are stored in `./logs/` directory.

## Usage

After setting up the project, access the web interface at:

- **Development**: `http://localhost:5173` (or the Vite dev server address)
- **Production**: `http://localhost:3030`
- **Remote (Tailscale)**: `http://your-hostname:3030` (e.g., `http://mac-mini:3030`)

The interface provides three printing modes:

- **Typewriter**: Print lines of text one at a time
- **Notetaker**: Write and print notes in Markdown format
- **Image Printer**: Print images from clipboard or file upload

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
