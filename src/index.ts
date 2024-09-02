import {
  ThermalPrinter,
  PrinterTypes,
  CharacterSet,
} from "node-thermal-printer";

async function main() {
  const printer = new ThermalPrinter({
    type: PrinterTypes.EPSON,
    interface: "tcp://192.168.1.32:9100",
    width: 42,
    // lineCharacter: "─",
    characterSet: CharacterSet.PC437_USA,
  });

  try {
    await printer.isPrinterConnected();
    console.log("Printer connected");

    printer.setTypeFontA();
    printer.setTextNormal();

    printer.print("hi bb.");
    printer.newLine();
    printer.newLine();
    printer.alignCenter();
    printer.printQR(
      "https://media.istockphoto.com/id/853493518/photo/blueberry-isolated-on-white-background.jpg?s=612x612&w=0&k=20&c=bRUIuOyJx74vcgZcf2BwjfhnGxaEJ3N6VNjsLn8eXtw%3D",
      {
        cellSize: 6,
      }
    );
    printer.newLine();
    printer.cut();

    await printer.execute();
    console.log("Print job sent to printer");
  } catch (error) {
    console.error("Error connecting to printer:", error);
  }
}

main();
