import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";

export default function Admin() {
  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Admin Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is a placeholder for the admin dashboard.</p>
        </CardContent>
      </Card>
    </div>
  );
}
