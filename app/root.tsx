import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  Link,
} from "@remix-run/react";
import { routes } from "~/lib/routes";
import "./tailwind.css";

const navItems = [{ title: "Home", route: "/" }, ...routes];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="min-h-screen font-sans">
        <header className="bg-muted p-4 border border-b">
          <nav>
            <ul className="flex space-x-4">
              {navItems.map((item) => (
                <li key={item.route}>
                  <Link to={item.route}>{item.title}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </header>
        <main className="flex-1">{children}</main>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
