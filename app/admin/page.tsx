import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { ClipboardList, Users, Package, CheckCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Admin Dashboard" };

export default async function AdminPage() {
  const pendingCount = await prisma.pendingEdit.count({
    where: { status: "PENDING" },
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Manage the Pool Products DB — review edits, manage users, and maintain data quality.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Pending Edits */}
        <div className="rounded-lg border bg-card p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <ClipboardList className="h-5 w-5 text-blue-600" />
            </div>
            {pendingCount > 0 && (
              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs font-medium">
                {pendingCount} pending
              </Badge>
            )}
          </div>
          <div>
            <h2 className="font-semibold">Pending Edits</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Review and approve community-submitted product edits.
            </p>
          </div>
          <ButtonLink size="sm" variant="outline" className="mt-auto w-fit" href="/admin/pending-edits">
            Open
          </ButtonLink>
        </div>

        {/* Products */}
        <div className="rounded-lg border bg-card p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div>
            <h2 className="font-semibold">Products</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Browse, add, and manage all products in the database.
            </p>
          </div>
          <ButtonLink size="sm" variant="outline" className="mt-auto w-fit" href="/products">
            Open
          </ButtonLink>
        </div>

        {/* Users — Coming Soon */}
        <div className="rounded-lg border bg-card p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
          </div>
          <div>
            <h2 className="font-semibold">Users</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Manage user accounts and roles.
            </p>
          </div>
          <Button size="sm" variant="outline" className="mt-auto w-fit" disabled>
            Open
          </Button>
        </div>

        {/* Edit History */}
        <div className="rounded-lg border bg-card p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div>
            <h2 className="font-semibold">Edit History</h2>
            <p className="text-sm text-muted-foreground mt-1">
              View the full audit log of approved changes.
            </p>
          </div>
          <ButtonLink size="sm" variant="outline" className="mt-auto w-fit" href="/admin/edit-history">
            Open
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
