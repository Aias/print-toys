import Link from "next/link";
import { routes } from "@/lib/routes";

const navItems = [{ title: "Home", route: "/" }, ...routes];

export function Navigation() {
  return (
    <nav>
      <ul className="flex space-x-8">
        {navItems.map((item) => (
          <li key={item.route}>
            <Link href={item.route}>{item.title}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
