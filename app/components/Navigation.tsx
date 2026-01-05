import { Link } from "react-router";
import { routes } from "~/lib/routes";

const navItems = [{ title: "Home", route: "/" }, ...routes];

export function Navigation() {
  return (
    <nav>
      <ul className="flex space-x-4">
        {navItems.map((item) => (
          <li key={item.route}>
            <Link to={item.route}>{item.title}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
