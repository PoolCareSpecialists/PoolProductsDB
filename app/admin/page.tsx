import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { ClipboardList, Users, Package, CheckCircle } from "lucide-react";

export const metadata = { title: "Admin Dashboard" };

const ADMIN_CARDS = [
  {
    icon: ClipboardList,
    title: "Pending Edits",
    description: "Review and approve community-submitted product edits.",
    href: "/admin/pending-edits",
    badge: null,
  },
  {
    icon: Package,
    title: "Products",
    description: "Browse, add, and manage all products in the database.",
    href: "/products",
    badge: null,
  },
  {
    icon: Users,
    title: "Users",
    description: "Manage user accounts and roles.",
    href: "/admin/users",
    badge: "Coming Soon",
  },
  {
    icon: CheckCircle,
    title: "Edit History",
    description: "View the full audit log of approved changes.",
    href: "/admin/history",
    badge: "Coming Soon",
  },
];

export default function AdminPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Manage the Pool Products DB — review edits, manage users, and maintain data quality.
        </p>
      </div>

      {/* Auth notice */}
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 mb-8 text-sm text-yellow-800">
        <strong>Authentication not yet configured.</strong> Admin access will require sign-in once the auth system is set up.
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {ADMIN_CARDS.map((card) => (
          <div key={card.title} className="rounded-lg border bg-card p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <card.icon className="h-5 w-5 text-blue-600" />
              </div>
              {card.badge && (
                <Badge variant="secondary" className="text-xs">{card.badge}</Badge>
              )}
            </div>
            <div>
              <h2 className="font-semibold">{card.title}</h2>
              <p className="text-sm text-muted-foreground mt-1">{card.description}</p>
            </div>
            {card.badge ? (
              <Button size="sm" variant="outline" className="mt-auto w-fit" disabled>
                Open
              </Button>
            ) : (
              <ButtonLink size="sm" variant="outline" className="mt-auto w-fit" href={card.href}>
                Open
              </ButtonLink>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
