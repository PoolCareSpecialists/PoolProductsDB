import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/30 mt-auto">
      <div className="container mx-auto px-4 py-8 flex flex-col sm:flex-row gap-4 items-center justify-between text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Pool Products DB. Community maintained.</p>
        <nav className="flex gap-4">
          <Link href="/api/v1/products" className="hover:text-foreground transition-colors">
            API
          </Link>
          <Link href="/about" className="hover:text-foreground transition-colors">
            About
          </Link>
          <Link href="/contribute" className="hover:text-foreground transition-colors">
            Contribute
          </Link>
        </nav>
      </div>
    </footer>
  );
}
