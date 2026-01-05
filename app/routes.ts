import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/_index.tsx"),
  route("typewriter", "routes/typewriter.tsx"),
  route("print-image", "routes/print-image.tsx"),
  route("notetaker", "routes/notetaker.tsx"),
  route("actions/print-markdown", "routes/actions.print-markdown.ts"),
  route("actions/print-image", "routes/actions.print-image.ts"),
] satisfies RouteConfig;
