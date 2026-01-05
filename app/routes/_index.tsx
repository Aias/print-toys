import { Link } from "react-router";
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
      <h1 className="mb-6 text-3xl font-bold">Printing Experiments</h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {routes.map((experiment) => (
          <Link
            key={experiment.route}
            to={experiment.route}
            className="no-underline"
          >
            <Card className="transition-shadow duration-300 hover:shadow-lg">
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
