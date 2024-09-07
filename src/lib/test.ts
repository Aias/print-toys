import { encoder, addDefaultQRCode, padAndCut, sendToPrinter } from "./helpers";

async function test() {
  // Initialize the encoder
  let result = encoder.initialize();

  // Test text and line wrapping
  result = result
    .line("Hello, world!")
    .newline()
    .line(
      "This is a very long line that I am going to expect to wrap to another, and I want to see where it breaks. We can add a few sentences to see if it does it correctly. Will it wrap right at a particular character? Or will it wrap at a word? We'll experiment a bit to see."
    )
    .rule()
    .size("small")
    .line("Here's some really tiny text.")
    .size("normal")
    .align("center")
    .line("Centered text")
    .align("right")
    .line("Right aligned text")
    .align("left")
    .line("Left aligned text");

  // Test styles
  result = result
    .bold(true)
    .line("Bold text")
    .bold(false)
    .underline(true)
    .line("Underlined text")
    .underline(false)
    .italic(true)
    .line("Italic text (if supported)")
    .italic(false)
    .invert(true)
    .line("Inverted text")
    .invert(false);

  // Test width and height
  result = result
    .width(2)
    .line("Double width text")
    .width(1)
    .height(2)
    .line("Double height text")
    .height(1)
    .width(2)
    .height(2)
    .line("Double width and height text")
    .width(1)
    .height(1);

  // Test table
  result = result.table(
    [
      { width: 20, marginRight: 2, align: "left" },
      { width: 20, align: "right" },
    ],
    [
      ["Item 1", "€ 10,00"],
      ["Item 2", "15,00"],
      ["Item 3", "9,95"],
      ["Item 4", "4,75"],
      ["Item 5", "211,05"],
      ["", "=".repeat(10)],
      ["Total", (encoder) => encoder.bold().text("€ 250,75").bold()],
    ]
  );

  // Test box
  result = result.box(
    { width: 30, align: "right", style: "double", marginLeft: 10 },
    "The quick brown fox jumps over the lazy dog"
  );

  // Test rule
  result = result.rule({ style: "double" });

  // Test barcode
  result = result.barcode("3130630574613", "ean13", 60);

  // Test QR code
  result = addDefaultQRCode(
    result,
    "https://media.istockphoto.com/id/853493518/photo/blueberry-isolated-on-white-background.jpg?s=612x612&w=0&k=20&c=bRUIuOyJx74vcgZcf2BwjfhnGxaEJ3N6VNjsLn8eXtw%3D"
  );

  // Test ASCII characters
  result = result.line(
    "ASCII: " +
      Array.from({ length: 128 }, (_, i) => String.fromCharCode(i)).join("")
  );
  // Test special characters
  result = result.line(
    `Special characters: – — ‒ –‾ ⁃ ‐ − −‾ ⁄ ‖ ‗ ‘ ’ ‚ ‛ “ ” „ ‟ † ‡ ‹ › ‼ ‾ ⁄ € ‱ ™ \` ~`
  );

  // Add padding and cut
  result = padAndCut(result);

  // Encode the result
  const encodedResult = result.encode();

  // Send the encoded result to the printer
  await sendToPrinter(encodedResult)
    .then(() => {
      console.log("Print job successful.");
    })
    .catch((error) => {
      console.error("Error connecting to printer:", error);
    });
}

test();
