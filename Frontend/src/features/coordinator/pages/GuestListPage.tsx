import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

export const GuestListPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-semibold">Guest Management</h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Guest List
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Manage external guest reviewers, faculty assignments, and access permissions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
