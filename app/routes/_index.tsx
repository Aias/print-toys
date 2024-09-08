import { Link } from "@remix-run/react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "~/components/ui/card";
import { routes } from "~/lib/routes";

export default function Index() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Printing Experiments</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {routes.map((experiment) => (
          <Link
            key={experiment.route}
            to={experiment.route}
            className="no-underline"
          >
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle>{experiment.title}</CardTitle>
                <CardDescription>{experiment.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
