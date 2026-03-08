import { ButtonLink } from "@/components/ui/button-link";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ClipboardList } from "lucide-react";

export const metadata = { title: "Pending Edits" };

export default function PendingEditsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6 flex items-center gap-3">
        <ButtonLink variant="ghost" size="sm" href="/admin">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Admin
        </ButtonLink>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Pending Edits</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Review and approve community-submitted product edits.
          </p>
        </div>
        <Badge variant="secondary">Auth required</Badge>
      </div>

      <div className="flex flex-col items-center justify-center py-20 text-center gap-3 text-muted-foreground">
        <ClipboardList className="h-12 w-12 opacity-30" />
        <p className="font-medium">No pending edits</p>
        <p className="text-sm">
          Once users submit product edits, they will appear here for review.
          <br />
          This page requires auth — coming soon.
        </p>
      </div>
    </div>
  );
}
