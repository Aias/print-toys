import readline from "readline";
import { encoder } from "./encoder";
import { padAndCut, sendToPrinter } from "./helpers";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log(
  "Type your input and press Enter to print. Paper will be cut on exit."
);

rl.on("line", async (input) => {
  encoder.initialize().line(input);
  const encodedResult = encoder.encode();
  await sendToPrinter(encodedResult).catch((error) => {
    console.error("Error while printing line:", error);
  });
});

rl.on("close", async () => {
  let result = encoder.initialize();
  result = padAndCut(result);
  const encodedResult = result.encode();
  await sendToPrinter(encodedResult)
    .then(() => {
      console.log("Paper cut.");
    })
    .catch((error) => {
      console.error("Error connecting to printer:", error);
    });
  console.log("Exiting...");
  process.exit(0);
});
