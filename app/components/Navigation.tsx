import { Link } from "@remix-run/react";
import { routes } from "~/lib/routes";
import { Switch } from "~/components/ui/switch";

const navItems = [{ title: "Home", route: "/" }, ...routes];

interface NavigationProps {
  queueEnabled: boolean;
  toggleQueue: (enable: boolean) => void;
}

export function Navigation({ queueEnabled, toggleQueue }: NavigationProps) {
  return (
    <nav className="flex justify-between items-center">
      <ul className="flex space-x-4">
        {navItems.map((item) => (
          <li key={item.route}>
            <Link to={item.route}>{item.title}</Link>
          </li>
        ))}
      </ul>
      <div className="flex items-center space-x-2">
        <span>Printing Enabled</span>
        <Switch checked={queueEnabled} onCheckedChange={toggleQueue} />
      </div>
    </nav>
  );
}
