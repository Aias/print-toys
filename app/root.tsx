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
      <body>
        <header className="bg-gray-800 text-white p-4">
          <nav>
            <ul className="flex space-x-4">
              {navItems.map((item) => (
                <li key={item.route}>
                  <Link to={item.route} className="hover:text-gray-300">
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </header>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
