# print-toys

Print Toys is An exploratory playground for integrating a web front-end and Node environment with Epson thermal printers. Specifically, I'm working with the Epson TM-T88VI. The goal is to develop a framework for sending and scheduling print jobs remotely to the printer, even when I'm not connected to the local network.

**NOTE:** When I say _playground_, I mean it. Significant portions of the code in this repo are AI-generated. Many of the technologies used are unfamiliar to me and I'm basically just hacking it all together from poorly-written user manuals. Exercise caution when using, modifying, or attempting to deploy any part of this codebase in your own environment.

## Features

- Queue management for print jobs
- XML-based communication with Epson printers
- ESC/POS command generation and processing
- Configuration management for print settings

## Setup

The following setup assumes you have an Epson TM-T88VI printer already set up and connected via ethernet to your local network. Setup steps may be similar for other models, but at a minimum the printer should support Server Direct Printing for connecting to a remote host.

1. Clone the repository:

   ```
   git clone https://github.com/your-username/print-toys.git
   cd print-toys
   ```

2. Install dependencies:

   ```
   yarn install
   ```

3. Run Prisma migrations:

   ```
   npx prisma migrate dev
   ```

4. Start the development server:

   ```
   yarn dev
   ```

5. Get the local network address of your server and use the Epson configuration app or the web admin interface to point Server Direct Print to `http://<network-address>:<port>/queue`.

## Usage

After setting up the project, you can access the various utilities through the web interface. The main entry point for print job management is the `/queue` route.
