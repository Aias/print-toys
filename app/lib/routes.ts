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
    title: "Admin",
    route: "/admin",
    description: "Administer the printer and print jobs.",
  },
];
