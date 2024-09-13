export interface RouteInfo {
  title: string;
  route: string;
  description: string;
}

export const routes: RouteInfo[] = [
  {
    title: "Typewriter",
    route: "/typewriter",
    description:
      "Print lines of text one at a time, simulating a typewriter experience.",
  },
  {
    title: "Notetaker",
    route: "/notetaker",
    description: "Write and print notes in Markdown format.",
  },
  {
    title: "Image Printer",
    route: "/print-image",
    description: "Print an image from the clipboard or file upload.",
  },
  {
    title: "Admin",
    route: "/admin",
    description: "Administer the printer and print jobs.",
  },
];
