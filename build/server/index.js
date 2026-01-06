import { jsx, jsxs } from "react/jsx-runtime";
import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable } from "@react-router/node";
import { ServerRouter, Link, UNSAFE_withComponentProps, Outlet, Meta, Links, ScrollRestoration, Scripts, useSubmit, Form, data, useFetcher } from "react-router";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useState, useRef, useCallback, useEffect } from "react";
import { Button as Button$1 } from "@base-ui/react/button";
import { cva } from "class-variance-authority";
import { Input as Input$1 } from "@base-ui/react/input";
import ReceiptPrinterEncoder from "@point-of-sale/receipt-printer-encoder";
import { createCanvas, loadImage } from "canvas";
import "dotenv/config";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import * as runtime from "@prisma/client/runtime/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as usb from "usb";
import * as cheerio from "cheerio";
import { Marked } from "marked";
const ABORT_DELAY = 5e3;
function handleRequest(request, responseStatusCode, responseHeaders, remixContext, loadContext) {
  return isbot(request.headers.get("user-agent") || "") ? handleBotRequest(
    request,
    responseStatusCode,
    responseHeaders,
    remixContext
  ) : handleBrowserRequest(
    request,
    responseStatusCode,
    responseHeaders,
    remixContext
  );
}
function handleBotRequest(request, responseStatusCode, responseHeaders, remixContext) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(ServerRouter, { context: remixContext, url: request.url }),
      {
        onAllReady() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
    setTimeout(abort, ABORT_DELAY);
  });
}
function handleBrowserRequest(request, responseStatusCode, responseHeaders, remixContext) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(ServerRouter, { context: remixContext, url: request.url }),
      {
        onShellReady() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
    setTimeout(abort, ABORT_DELAY);
  });
}
const entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest
}, Symbol.toStringTag, { value: "Module" }));
const routes$1 = [
  {
    title: "Typewriter",
    route: "/typewriter",
    description: "Print lines of text one at a time, simulating a typewriter experience."
  },
  {
    title: "Notetaker",
    route: "/notetaker",
    description: "Write and print notes in Markdown format."
  },
  {
    title: "Image Printer",
    route: "/print-image",
    description: "Print an image from the clipboard or file upload."
  }
];
const navItems = [{ title: "Home", route: "/" }, ...routes$1];
function Navigation() {
  return /* @__PURE__ */ jsx("nav", { children: /* @__PURE__ */ jsx("ul", { className: "flex space-x-4", children: navItems.map((item) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(Link, { to: item.route, children: item.title }) }, item.route)) }) });
}
function Layout({
  children
}) {
  return /* @__PURE__ */ jsxs("html", {
    lang: "en",
    children: [/* @__PURE__ */ jsxs("head", {
      children: [/* @__PURE__ */ jsx("meta", {
        charSet: "utf-8"
      }), /* @__PURE__ */ jsx("meta", {
        name: "viewport",
        content: "width=device-width, initial-scale=1"
      }), /* @__PURE__ */ jsx(Meta, {}), /* @__PURE__ */ jsx(Links, {})]
    }), /* @__PURE__ */ jsxs("body", {
      className: "min-h-screen font-sans",
      children: [/* @__PURE__ */ jsx("header", {
        className: "bg-muted border border-b p-4",
        children: /* @__PURE__ */ jsx(Navigation, {})
      }), /* @__PURE__ */ jsx("main", {
        className: "flex-1",
        children
      }), /* @__PURE__ */ jsx(ScrollRestoration, {}), /* @__PURE__ */ jsx(Scripts, {})]
    })]
  });
}
const root = UNSAFE_withComponentProps(function App() {
  return /* @__PURE__ */ jsx(Outlet, {});
});
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Layout,
  default: root
}, Symbol.toStringTag, { value: "Module" }));
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
function Card({
  className,
  size = "default",
  ...props
}) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "card",
      "data-size": size,
      className: cn(
        "ring-foreground/10 bg-card text-card-foreground group/card flex flex-col gap-4 overflow-hidden rounded-none py-4 text-xs/relaxed ring-1 has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 data-[size=sm]:gap-2 data-[size=sm]:py-3 data-[size=sm]:has-data-[slot=card-footer]:pb-0 *:[img:first-child]:rounded-none *:[img:last-child]:rounded-none",
        className
      ),
      ...props
    }
  );
}
function CardHeader({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "card-header",
      className: cn(
        "group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-none px-4 group-data-[size=sm]/card:px-3 has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-4 group-data-[size=sm]/card:[.border-b]:pb-3",
        className
      ),
      ...props
    }
  );
}
function CardTitle({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "card-title",
      className: cn(
        "text-sm font-medium group-data-[size=sm]/card:text-sm",
        className
      ),
      ...props
    }
  );
}
function CardDescription({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "card-description",
      className: cn("text-muted-foreground text-xs/relaxed", className),
      ...props
    }
  );
}
const _index = UNSAFE_withComponentProps(function Index() {
  return /* @__PURE__ */ jsxs("div", {
    className: "p-8",
    children: [/* @__PURE__ */ jsx("h1", {
      className: "mb-6 text-3xl font-bold",
      children: "Printing Experiments"
    }), /* @__PURE__ */ jsx("div", {
      className: "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3",
      children: routes$1.map((experiment) => /* @__PURE__ */ jsx(Link, {
        to: experiment.route,
        className: "no-underline",
        children: /* @__PURE__ */ jsx(Card, {
          className: "transition-shadow duration-300 hover:shadow-lg",
          children: /* @__PURE__ */ jsxs(CardHeader, {
            children: [/* @__PURE__ */ jsx(CardTitle, {
              children: experiment.title
            }), /* @__PURE__ */ jsx(CardDescription, {
              children: experiment.description
            })]
          })
        })
      }, experiment.route))
    })]
  });
});
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: _index
}, Symbol.toStringTag, { value: "Module" }));
const buttonVariants = cva(
  "focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 rounded-none border border-transparent bg-clip-padding text-xs font-medium focus-visible:ring-1 aria-invalid:ring-1 [&_svg:not([class*='size-'])]:size-4 inline-flex items-center justify-center whitespace-nowrap transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none shrink-0 [&_svg]:shrink-0 outline-none group/button select-none",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        outline: "border-border bg-background hover:bg-muted hover:text-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 aria-expanded:bg-muted aria-expanded:text-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost: "hover:bg-muted hover:text-foreground dark:hover:bg-muted/50 aria-expanded:bg-muted aria-expanded:text-foreground",
        destructive: "bg-destructive/10 hover:bg-destructive/20 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/20 text-destructive focus-visible:border-destructive/40 dark:hover:bg-destructive/30",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 rounded-none px-2 text-xs has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-none px-2.5 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        icon: "size-8",
        "icon-xs": "size-6 rounded-none [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-7 rounded-none",
        "icon-lg": "size-9"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}) {
  return /* @__PURE__ */ jsx(
    Button$1,
    {
      "data-slot": "button",
      className: cn(buttonVariants({ variant, size, className })),
      ...props
    }
  );
}
function Input({ className, type, ...props }) {
  return /* @__PURE__ */ jsx(
    Input$1,
    {
      type,
      "data-slot": "input",
      className: cn(
        "dark:bg-input/30 border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 disabled:bg-input/50 dark:disabled:bg-input/80 file:text-foreground placeholder:text-muted-foreground h-8 w-full min-w-0 rounded-none border bg-transparent px-2.5 py-1 text-xs transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-xs file:font-medium focus-visible:ring-1 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-1 md:text-xs",
        className
      ),
      ...props
    }
  );
}
const defaultOptions = {
  printerModel: "epson-tm-t88vi",
  feedBeforeCut: 7,
  imageMode: "raster",
  createCanvas
};
const encoder = new ReceiptPrinterEncoder(defaultOptions);
const createEncoder = (options) => {
  const encoder2 = new ReceiptPrinterEncoder({
    ...defaultOptions,
    ...options
  });
  return encoder2.initialize().codepage("auto");
};
const config = {
  "previewFeatures": [],
  "clientVersion": "7.2.0",
  "engineVersion": "0c8ef2ce45c83248ab3df073180d5eda9e8be7a3",
  "activeProvider": "postgresql",
  "inlineSchema": 'datasource db {\n  provider = "postgresql"\n}\n\ngenerator client {\n  provider = "prisma-client"\n  output   = "../generated/prisma"\n}\n\nmodel PrintJob {\n  jobId          String    @id @default(uuid())\n  escPosCommands Bytes\n  printed        Boolean   @default(false)\n  submitted      DateTime  @default(now())\n  printedAt      DateTime?\n}\n',
  "runtimeDataModel": {
    "models": {},
    "enums": {},
    "types": {}
  }
};
config.runtimeDataModel = JSON.parse('{"models":{"PrintJob":{"fields":[{"name":"jobId","kind":"scalar","type":"String"},{"name":"escPosCommands","kind":"scalar","type":"Bytes"},{"name":"printed","kind":"scalar","type":"Boolean"},{"name":"submitted","kind":"scalar","type":"DateTime"},{"name":"printedAt","kind":"scalar","type":"DateTime"}],"dbName":null}},"enums":{},"types":{}}');
async function decodeBase64AsWasm(wasmBase64) {
  const { Buffer: Buffer2 } = await import("node:buffer");
  const wasmArray = Buffer2.from(wasmBase64, "base64");
  return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
  getRuntime: async () => await import("@prisma/client/runtime/query_compiler_bg.postgresql.mjs"),
  getQueryCompilerWasmModule: async () => {
    const { wasm } = await import("@prisma/client/runtime/query_compiler_bg.postgresql.wasm-base64.mjs");
    return await decodeBase64AsWasm(wasm);
  }
};
function getPrismaClientClass() {
  return runtime.getPrismaClient(config);
}
globalThis["__dirname"] = path.dirname(fileURLToPath(import.meta.url));
const PrismaClient = getPrismaClientClass();
const LINE_WIDTH_PX = 512;
const USB_VENDOR_ID = 1208;
const USB_PRODUCT_ID = 514;
const USB_INTERFACE_NUMBER = 0;
async function sendToPrinter(data2, debug = false) {
  return new Promise((resolve, reject) => {
    try {
      const device = usb.findByIds(USB_VENDOR_ID, USB_PRODUCT_ID);
      if (!device) {
        reject(
          new Error(
            `USB printer not found (VID: ${USB_VENDOR_ID.toString(16)}, PID: ${USB_PRODUCT_ID.toString(16)})`
          )
        );
        return;
      }
      if (debug) console.log("Found USB printer:", device.deviceDescriptor);
      device.open();
      const iface = device.interface(USB_INTERFACE_NUMBER);
      if (iface.isKernelDriverActive()) {
        iface.detachKernelDriver();
      }
      iface.claim();
      const endpoint = iface.endpoints.find(
        (ep) => ep.direction === "out"
      );
      if (!endpoint) {
        device.close();
        reject(new Error("OUT endpoint not found on USB printer"));
        return;
      }
      if (debug)
        console.log(
          `Sending ${data2.length} bytes to USB printer on endpoint ${endpoint.address}...`
        );
      endpoint.transfer(Buffer.from(data2), (error) => {
        try {
          iface.release(true, () => {
            device.close();
          });
        } catch (e) {
          console.error("Error releasing USB interface:", e);
        }
        if (error) {
          reject(error);
        } else {
          if (debug) console.log("USB print successful");
          resolve();
        }
      });
    } catch (error) {
      reject(error);
    }
  });
}
const adapter = new PrismaPg({
  connectionString: process.env.POSTGRES_PRISMA_URL
});
const prisma = new PrismaClient({ adapter });
async function markJobAsPrinted(jobId) {
  await prisma.printJob.update({
    where: { jobId },
    data: { printed: true, printedAt: /* @__PURE__ */ new Date() }
  });
}
async function createPrintJob(escPosCommands) {
  const job = await prisma.printJob.create({
    data: {
      escPosCommands: new Uint8Array(escPosCommands)
    }
  });
  return { jobId: job.jobId, escPosCommands };
}
async function printJobImmediately(jobId, escPosCommands) {
  try {
    await sendToPrinter(escPosCommands, false);
    await markJobAsPrinted(jobId);
    console.log(`✓ Job ${jobId} printed via USB`);
  } catch (error) {
    console.error(`✗ Failed to print job ${jobId}:`, error);
  }
}
async function createAndPrintJob(escPosCommands) {
  const job = await createPrintJob(escPosCommands);
  printJobImmediately(job.jobId, escPosCommands).catch((err) => {
    console.error("Background print failed:", err);
  });
  return job;
}
const defaultAdjustments = {
  contrast: 1.5,
  brightness: 10,
  gamma: 0.5
};
async function processImage(image, adjustments = defaultAdjustments) {
  let { width, height } = image;
  if (width > LINE_WIDTH_PX) {
    const aspectRatio = width / height;
    width = LINE_WIDTH_PX;
    height = Math.round(width / aspectRatio);
  }
  width = Math.floor(width / 8) * 8;
  height = Math.floor(height / 8) * 8;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0, width, height);
  const imageData = ctx.getImageData(0, 0, width, height);
  const data2 = imageData.data;
  for (let i = 0; i < data2.length; i += 4) {
    data2[i] = Math.pow(data2[i] / 255, adjustments.gamma) * 255;
    data2[i + 1] = Math.pow(data2[i + 1] / 255, adjustments.gamma) * 255;
    data2[i + 2] = Math.pow(data2[i + 2] / 255, adjustments.gamma) * 255;
    for (let j = 0; j < 3; j++) {
      data2[i + j] = ((data2[i + j] / 255 - 0.5) * adjustments.contrast + 0.5) * 255;
    }
    data2[i] += adjustments.brightness;
    data2[i + 1] += adjustments.brightness;
    data2[i + 2] += adjustments.brightness;
    data2[i] = Math.max(0, Math.min(255, data2[i]));
    data2[i + 1] = Math.max(0, Math.min(255, data2[i + 1]));
    data2[i + 2] = Math.max(0, Math.min(255, data2[i + 2]));
  }
  ctx.putImageData(imageData, 0, 0);
  return { canvas, width, height };
}
async function urlToCanvasImage(url, adjustments) {
  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const image = await loadImage(buffer);
    return processImage(image, adjustments);
  } catch (error) {
    console.error("Error processing image from URL:", error);
    throw error;
  }
}
async function rawDataToCanvasImage(rawData, adjustments) {
  try {
    const image = await loadImage(rawData);
    return processImage(image, adjustments);
  } catch (error) {
    console.error("Error processing raw image data:", error);
    throw error;
  }
}
const commonReplacements = [
  // {
  //   search: /[\u201C\u201D""]/g,
  //   replace: '"',
  // },
  // {
  //   search: /[\u2018\u2019'']/g,
  //   replace: "'",
  // },
  // {
  //   search: /[–—]/g,
  //   replace: "-",
  // },
  {
    search: /\n/g,
    replace: ""
  },
  {
    search: /\r/g,
    replace: ""
  },
  {
    search: /\s+/g,
    replace: " "
  }
];
async function htmlToEscPos(html) {
  let encoder2 = createEncoder();
  const $ = cheerio.load(html);
  async function processNode(node) {
    const $node = $(node);
    if (node.type === "text") {
      let textContent = $node.text();
      if (textContent.trim().length > 0) {
        encoder2.text(`${textContent}`);
      }
    } else if (node.type === "tag") {
      const element = $(node);
      switch (node.name.toLowerCase()) {
        case "h1":
          encoder2.bold(true).size(2);
          encoder2.text(element.text().trim());
          encoder2.bold(false).size(1);
          encoder2.newline();
          break;
        case "h2":
          encoder2.bold(true);
          encoder2.rule({ style: "double" });
          encoder2.newline();
          encoder2.line(`${element.text().trim().toUpperCase()}`);
          encoder2.bold(false);
          break;
        case "h3":
        case "h4":
        case "h5":
        case "h6":
          encoder2.newline();
          encoder2.bold(true).invert(true);
          encoder2.align("center");
          encoder2.line(`[ ${element.text().trim()} ]`);
          encoder2.align("left");
          encoder2.bold(false).invert(false);
          break;
        case "b":
        case "strong":
          encoder2.bold(true);
          for (const child of element.contents().get()) {
            await processNode(child);
          }
          encoder2.bold(false);
          break;
        case "i":
        case "em":
          encoder2.bold(true);
          for (const child of element.contents().get()) {
            await processNode(child);
          }
          encoder2.bold(false);
          break;
        case "u":
          encoder2.underline(true);
          for (const child of element.contents().get()) {
            await processNode(child);
          }
          encoder2.underline(false);
          break;
        case "a":
          encoder2.underline(true);
          encoder2.text(`${element.text()} [${element.attr("href") || ""}]`);
          encoder2.underline(false);
          break;
        case "br":
          encoder2.newline();
          break;
        case "hr":
          encoder2.newline();
          encoder2.rule({ style: "single" });
          break;
        case "img":
          try {
            const src = element.attr("src");
            if (src) {
              let processedImage;
              if (src.startsWith("data:image")) {
                const rawData = Buffer.from(src.split(",")[1], "base64");
                processedImage = await rawDataToCanvasImage(rawData);
              } else {
                processedImage = await urlToCanvasImage(src);
              }
              const { canvas, width, height } = processedImage;
              encoder2.image(canvas, width, height, "floydsteinberg");
            }
          } catch (error) {
            console.error("Error processing image:", error);
            encoder2.line("[Image failed to load]");
          }
          break;
        case "blockquote":
          encoder2.font("B").align("right");
          for (const child of element.contents().get()) {
            await processNode(child);
          }
          encoder2.font("A").align("left");
          break;
        case "code":
          encoder2.font("B");
          encoder2.box(
            {
              paddingLeft: 2,
              paddingRight: 2,
              style: "single",
              align: "left"
            },
            element.text().trim()
          );
          encoder2.font("A");
          break;
        case "p":
        case "ul":
        case "ol":
          encoder2.newline();
          for (const child of element.contents().get()) {
            await processNode(child);
          }
          encoder2.newline();
          break;
        case "li":
          encoder2.text("- ");
          for (const child of element.contents().get()) {
            await processNode(child);
          }
          if (element.next("li").length) {
            encoder2.newline();
          }
          break;
        case "div":
        case "span":
        default:
          for (const child of element.contents().get()) {
            await processNode(child);
          }
      }
    }
  }
  for (const node of $("body").contents().get()) {
    await processNode(node);
  }
  return encoder2.cut().encode();
}
const action$3 = async ({
  request
}) => {
  const formData = await request.formData();
  const action2 = formData.get("action");
  const line = formData.get("line");
  if (action2 === "print" && typeof line === "string") {
    let replacedLine = line;
    commonReplacements.forEach(({
      search,
      replace
    }) => {
      replacedLine = replacedLine.replace(search, replace);
    });
    const escPosCommands = encoder.initialize().line(replacedLine).encode();
    await createAndPrintJob(escPosCommands);
    return data({
      success: true,
      line: replacedLine
    });
  } else if (action2 === "cut") {
    const escPosCommands = encoder.initialize().cut().encode();
    await createAndPrintJob(escPosCommands);
    return data({
      success: true,
      cut: true
    });
  }
  return data({
    success: false
  });
};
const typewriter = UNSAFE_withComponentProps(function Typewriter({
  actionData
}) {
  const [line, setLine] = useState("");
  const [printedSections, setPrintedSections] = useState([[]]);
  const submit = useSubmit();
  const lastActionRef = useRef(null);
  const handleSubmit = (e) => {
    e.preventDefault();
    submit(e.currentTarget, {
      method: "post"
    });
    setLine("");
  };
  const handleCut = useCallback(() => {
    submit({
      action: "cut"
    }, {
      method: "post"
    });
  }, [submit]);
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        handleCut();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleCut]);
  useEffect(() => {
    if (!actionData?.success || actionData === lastActionRef.current) {
      return;
    }
    lastActionRef.current = actionData;
    if ("line" in actionData) {
      setPrintedSections((prev) => {
        const newSections = [...prev];
        const lastSection = newSections[newSections.length - 1];
        if (!lastSection.includes(actionData.line)) {
          newSections[newSections.length - 1] = [...lastSection, actionData.line];
        }
        return newSections;
      });
    } else if ("cut" in actionData) {
      setPrintedSections((prev) => {
        if (prev[prev.length - 1].length > 0) {
          return [...prev, []];
        }
        return prev;
      });
    }
  }, [actionData]);
  return /* @__PURE__ */ jsxs("div", {
    className: "p-4",
    children: [/* @__PURE__ */ jsx("h1", {
      className: "mb-4 text-2xl font-bold",
      children: "Typewriter"
    }), /* @__PURE__ */ jsx(Form, {
      onSubmit: handleSubmit,
      className: "space-y-4",
      children: /* @__PURE__ */ jsxs("div", {
        className: "flex space-x-2",
        children: [/* @__PURE__ */ jsx(Input, {
          type: "text",
          name: "line",
          value: line,
          onChange: (e) => setLine(e.target.value),
          placeholder: "Type a line and press Enter",
          className: "grow"
        }), /* @__PURE__ */ jsx("input", {
          type: "hidden",
          name: "action",
          value: "print"
        }), /* @__PURE__ */ jsx(Button, {
          type: "submit",
          className: "whitespace-nowrap",
          children: "Print Line"
        })]
      })
    }), /* @__PURE__ */ jsx(Button, {
      onClick: handleCut,
      className: "mt-4 w-full",
      children: "Cut Page (Cmd+Enter)"
    }), printedSections.map((section, sectionIndex) => /* @__PURE__ */ jsxs("div", {
      className: "mt-8",
      children: [sectionIndex > 0 && /* @__PURE__ */ jsx("hr", {
        className: "my-4 border-gray-300"
      }), section.length > 0 && /* @__PURE__ */ jsx("div", {
        children: /* @__PURE__ */ jsx("pre", {
          className: "font-mono whitespace-pre-wrap",
          children: section.join("\n")
        })
      })]
    }, sectionIndex))]
  });
});
const route2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$3,
  default: typewriter
}, Symbol.toStringTag, { value: "Module" }));
const printImage = UNSAFE_withComponentProps(function PrintImage() {
  const fetcher = useFetcher();
  const fileInputRef = useRef(null);
  const handleSubmit = useCallback((event) => {
    event.preventDefault();
    if (fileInputRef.current?.files?.[0]) {
      const formData = new FormData();
      formData.append("image", fileInputRef.current.files[0]);
      fetcher.submit(formData, {
        method: "post",
        action: "/actions/print-image",
        encType: "multipart/form-data"
      });
    }
  }, [fetcher]);
  const handlePasteImage = useCallback(async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      for (const clipboardItem of clipboardItems) {
        for (const type of clipboardItem.types) {
          if (type.startsWith("image/")) {
            const blob = await clipboardItem.getType(type);
            const formData = new FormData();
            formData.append("image", blob, "clipboard-image.png");
            fetcher.submit(formData, {
              method: "post",
              action: "/actions/print-image",
              encType: "multipart/form-data"
            });
            return;
          }
        }
      }
      alert("No image found in clipboard");
    } catch (err) {
      console.error("Failed to read clipboard contents: ", err);
    }
  }, [fetcher]);
  return /* @__PURE__ */ jsxs("div", {
    className: "mx-auto max-w-[720px] p-4",
    children: [/* @__PURE__ */ jsx("h1", {
      className: "mb-4 text-2xl font-bold",
      children: "Print Image"
    }), /* @__PURE__ */ jsx("form", {
      onSubmit: handleSubmit,
      className: "space-y-4",
      children: /* @__PURE__ */ jsxs("div", {
        className: "flex items-center space-x-2",
        children: [/* @__PURE__ */ jsx(Input, {
          type: "file",
          name: "image",
          accept: "image/*",
          required: true,
          className: "grow",
          ref: fileInputRef
        }), /* @__PURE__ */ jsx(Button, {
          type: "submit",
          children: "Print Image"
        })]
      })
    }), /* @__PURE__ */ jsx(Button, {
      onClick: handlePasteImage,
      className: "mt-4 w-full",
      children: "Print Clipboard Image"
    }), fetcher.data?.success && /* @__PURE__ */ jsx("p", {
      className: "mt-4 text-green-600",
      children: fetcher.data.message
    }), fetcher.data?.success === false && /* @__PURE__ */ jsxs("p", {
      className: "mt-4 text-red-600",
      children: ["Error: ", fetcher.data.message]
    })]
  });
});
const route3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: printImage
}, Symbol.toStringTag, { value: "Module" }));
function Textarea({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "textarea",
    {
      "data-slot": "textarea",
      className: cn(
        "border-input dark:bg-input/30 focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 disabled:bg-input/50 dark:disabled:bg-input/80 placeholder:text-muted-foreground flex field-sizing-content min-h-16 w-full rounded-none border bg-transparent px-2.5 py-2 text-xs transition-colors outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-1 md:text-xs",
        className
      ),
      ...props
    }
  );
}
const mdPatternLanguage = `
# A Pattern Language

A **book** by Christopher Alexander, Sara Ishikawa, and Murray Silverstein.

> This is a fundamental view of the world. It says that when you build a thing you cannot merely build that thing in isolation, but must also repair the world around it, and within it, so that the larger world at that one place becomes more coherent, and more whole; and the thing which you make takes its place in the web of nature, as you make it. - [Source](https://en.wikipedia.org/wiki/A_Pattern_Language)

## Connections

Connections are either **direct** (children) - found within the book - or **indirect** (related) - found outside the book.

### Children

1. *One* Its place in the web of nature
2. *Two* Scattered work
3. *Three* Four-story limit

### Related

- Deliberate acts
- patternsof.design
- 125 best architecture books
- The Timeless Way of Building

## Summary

At the core of *A Pattern Language* is the philosophy that in designing their environments people always rely on certain 'languages', which, like the languages we speak, allow them to articulate and communicate an infinite variety of designs within a formal system which gives them coherence.

\`\`\`
var x = 10;
  console.log(x);
	  x = 20;
\`\`\`

---

Christopher Wolfgang John Alexander (4 October 1936 – 17 March 2022) was an Austrian-born British-American architect and design theorist.`;
const mdWithImage = `
This is an image.

![photo](https://cdn.glass.photo/a70yd1tLEaKFHA58b6IJLXv0mje8rejx0V2kZLkgaWI/rs:fit:1024:1024:0/q:90/L3Bvc3QvNjg0YzZiMzktNTEwNy00N2QzLTljMmEtN2FkODNjMWI5YjZhL3Bob3Rv)
`;
const markdown = new Marked({
  breaks: true
});
function convertUrlsToImageMarkdown(text) {
  const imageUrlRegex = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif))/gi;
  return text.replace(imageUrlRegex, "![$1]($1)");
}
const action$2 = async ({
  request
}) => {
  const markdownText = await request.text();
  try {
    const html = await markdown.parse(convertUrlsToImageMarkdown(markdownText));
    const escPosCommands = await htmlToEscPos(html);
    await createAndPrintJob(escPosCommands);
    return data({
      success: true,
      message: "Note printed successfully"
    });
  } catch (error) {
    console.error("Error in action:", error);
    return data({
      success: false,
      message: `Failed to print note: ${error.message}`
    }, {
      status: 500
    });
  }
};
const route5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$2
}, Symbol.toStringTag, { value: "Module" }));
const action$1 = action$2;
const submitOptions = {
  method: "post",
  encType: "text/plain"
};
const notetaker = UNSAFE_withComponentProps(function Notetaker({
  actionData
}) {
  const [markdownText, setMarkdownText] = useState("");
  const submit = useSubmit();
  const handleSubmit = (e) => {
    e.preventDefault();
    submit(markdownText, submitOptions);
  };
  const handleTestPrint = (testContent) => {
    submit(testContent, submitOptions);
  };
  return /* @__PURE__ */ jsxs("div", {
    className: "mx-auto max-w-[720px] p-4",
    children: [/* @__PURE__ */ jsx("h1", {
      className: "mb-4 text-2xl font-bold",
      children: "Notetaker"
    }), /* @__PURE__ */ jsxs(Form, {
      onSubmit: handleSubmit,
      className: "mb-8 space-y-4",
      children: [/* @__PURE__ */ jsx(Textarea, {
        name: "markdownText",
        value: markdownText,
        onChange: (e) => setMarkdownText(e.target.value),
        placeholder: "Type your note in Markdown format",
        className: "h-64"
      }), /* @__PURE__ */ jsx(Button, {
        type: "submit",
        className: "w-full",
        children: "Print Note"
      })]
    }), actionData && /* @__PURE__ */ jsx("p", {
      className: `mt-4 ${actionData.success ? "text-green-600" : "text-red-600"}`,
      children: actionData.message
    }), /* @__PURE__ */ jsxs("div", {
      className: "mt-8",
      children: [/* @__PURE__ */ jsx("h2", {
        className: "mb-4 text-xl font-semibold",
        children: "Test Prints"
      }), /* @__PURE__ */ jsxs("div", {
        className: "grid grid-cols-2 gap-4",
        children: [/* @__PURE__ */ jsx(Button, {
          onClick: () => handleTestPrint(mdPatternLanguage),
          variant: "secondary",
          children: "Test Pattern Language"
        }), /* @__PURE__ */ jsx(Button, {
          onClick: () => handleTestPrint(mdWithImage),
          variant: "secondary",
          children: "Test With Image"
        })]
      })]
    })]
  });
});
const route4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$1,
  default: notetaker
}, Symbol.toStringTag, { value: "Module" }));
const action = async ({
  request
}) => {
  try {
    const formData = await request.formData();
    const imageData = formData.get("image");
    if (!imageData) {
      return data({
        success: false,
        message: "No image data provided"
      }, {
        status: 400
      });
    }
    const buffer = Buffer.from(await imageData.arrayBuffer());
    const {
      canvas,
      width,
      height
    } = await rawDataToCanvasImage(buffer);
    const encoder2 = createEncoder();
    encoder2.image(canvas, width, height, "atkinson");
    const printData = encoder2.cut().encode();
    await createAndPrintJob(printData);
    return data({
      success: true,
      message: "Image added to print queue"
    });
  } catch (error) {
    console.error("Error processing image for printing:", error);
    return data({
      success: false,
      message: `Failed to process image for printing: ${error.message}`
    }, {
      status: 500
    });
  }
};
const route6 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-qnrQcGlH.js", "imports": ["/assets/chunk-JMJ3UQ3L-BilMNg9t.js", "/assets/index-DkYg50eK.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/root-CHqefrh6.js", "imports": ["/assets/chunk-JMJ3UQ3L-BilMNg9t.js", "/assets/index-DkYg50eK.js", "/assets/routes-C6zPq4IJ.js"], "css": ["/assets/root-DUIILwcF.css"], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/_index": { "id": "routes/_index", "parentId": "root", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/_index-T3h0siZn.js", "imports": ["/assets/chunk-JMJ3UQ3L-BilMNg9t.js", "/assets/utils-CDN07tui.js", "/assets/routes-C6zPq4IJ.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/typewriter": { "id": "routes/typewriter", "parentId": "root", "path": "typewriter", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/typewriter-Dl-3X1LR.js", "imports": ["/assets/chunk-JMJ3UQ3L-BilMNg9t.js", "/assets/button-BzO9OnCD.js", "/assets/input-DZoGg-Zj.js", "/assets/utils-CDN07tui.js", "/assets/index-DkYg50eK.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/print-image": { "id": "routes/print-image", "parentId": "root", "path": "print-image", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/print-image-BvJhtNyU.js", "imports": ["/assets/chunk-JMJ3UQ3L-BilMNg9t.js", "/assets/button-BzO9OnCD.js", "/assets/input-DZoGg-Zj.js", "/assets/utils-CDN07tui.js", "/assets/index-DkYg50eK.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/notetaker": { "id": "routes/notetaker", "parentId": "root", "path": "notetaker", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/notetaker-CQ4gmg9Z.js", "imports": ["/assets/chunk-JMJ3UQ3L-BilMNg9t.js", "/assets/button-BzO9OnCD.js", "/assets/utils-CDN07tui.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/actions.print-markdown": { "id": "routes/actions.print-markdown", "parentId": "root", "path": "actions/print-markdown", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/actions.print-markdown-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/actions.print-image": { "id": "routes/actions.print-image", "parentId": "root", "path": "actions/print-image", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/actions.print-image-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 } }, "url": "/assets/manifest-33367b7d.js", "version": "33367b7d", "sri": void 0 };
const assetsBuildDirectory = "build/client";
const basename = "/";
const future = { "unstable_optimizeDeps": false, "unstable_subResourceIntegrity": false, "v8_middleware": false, "v8_splitRouteModules": false, "v8_viteEnvironmentApi": false };
const ssr = true;
const isSpaMode = false;
const prerender = [];
const routeDiscovery = { "mode": "lazy", "manifestPath": "/__manifest" };
const publicPath = "/";
const entry = { module: entryServer };
const routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  },
  "routes/_index": {
    id: "routes/_index",
    parentId: "root",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route1
  },
  "routes/typewriter": {
    id: "routes/typewriter",
    parentId: "root",
    path: "typewriter",
    index: void 0,
    caseSensitive: void 0,
    module: route2
  },
  "routes/print-image": {
    id: "routes/print-image",
    parentId: "root",
    path: "print-image",
    index: void 0,
    caseSensitive: void 0,
    module: route3
  },
  "routes/notetaker": {
    id: "routes/notetaker",
    parentId: "root",
    path: "notetaker",
    index: void 0,
    caseSensitive: void 0,
    module: route4
  },
  "routes/actions.print-markdown": {
    id: "routes/actions.print-markdown",
    parentId: "root",
    path: "actions/print-markdown",
    index: void 0,
    caseSensitive: void 0,
    module: route5
  },
  "routes/actions.print-image": {
    id: "routes/actions.print-image",
    parentId: "root",
    path: "actions/print-image",
    index: void 0,
    caseSensitive: void 0,
    module: route6
  }
};
export {
  serverManifest as assets,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  prerender,
  publicPath,
  routeDiscovery,
  routes,
  ssr
};
