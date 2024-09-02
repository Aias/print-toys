import EscPosEncoder from "esc-pos-encoder";
import { addDefaultQRCode, padAndCut, sendToPrinter } from "./helpers";

const encoder = new EscPosEncoder({
  width: 42,
  wordWrap: true,
});

async function main() {
  // Initialize the encoder
  let result = encoder
    .initialize()
    .line("Hello, world!")
    .line(
      "This is a very long line that I am going to expect to wrap to another, and I want to see where it breaks. We can add a few sentences to see if it does it correctly. Will it wrap right at a particular character? Or will it wrap at a word? We'll experiment a bit to see."
    )
    .rule()
    .size("small")
    .line("Here's some really tiny text.")
    .size("normal")
    .align("center");

  // Add QR code
  result = addDefaultQRCode(
    result,
    "https://media.istockphoto.com/id/853493518/photo/blueberry-isolated-on-white-background.jpg?s=612x612&w=0&k=20&c=bRUIuOyJx74vcgZcf2BwjfhnGxaEJ3N6VNjsLn8eXtw%3D"
  );

  // Add padding and cut
  result = padAndCut(result);

  // Encode the result
  const encodedResult = result.encode();

  // Send the encoded result to the printer
  sendToPrinter(encodedResult)
    .then(() => {
      console.log("Print job successful.");
    })
    .catch((error) => {
      console.error("Error connecting to printer:", error);
    });
}

main();
