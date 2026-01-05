#!/usr/bin/env tsx
/**
 * Simple test script to verify USB printer communication
 * Run with: npx tsx test-usb-print.ts
 */

import { createEncoder } from "./app/lib/encoder";
import { sendToPrinter } from "./app/lib/helpers";

async function testPrint() {
  console.log("Creating test print job...");

  const encoder = createEncoder();

  // Simple test print
  encoder
    .initialize()
    .line("USB Print Test")
    .line("==========================================")
    .newline()
    .line("Your Epson TM-T88VI is connected")
    .line("and ready to print!")
    .newline()
    .line("Safe ASCII decorations:")
    .line("==========================================")
    .line("------------------------------------------")
    .line("******************************************")
    .line("+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+")
    .line("| Table | Borders | Look | Like | This |")
    .line("+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+")
    .newline()
    .align("center")
    .bold()
    .line("Ready to use!")
    .bold()
    .align("left")
    .newline()
    .newline()
    .newline()
    .cut();

  const commands = encoder.encode();

  console.log(`Generated ${commands.length} bytes of ESC/POS commands`);
  console.log("Sending to USB printer...");

  try {
    await sendToPrinter(commands, true);
    console.log("\n✓ Print job sent successfully!");
  } catch (error) {
    console.error("\n✗ Print failed:", error);
    process.exit(1);
  }
}

testPrint();
