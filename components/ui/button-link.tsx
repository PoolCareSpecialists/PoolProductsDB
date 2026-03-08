import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

type ButtonLinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
} & VariantProps<typeof buttonVariants> &
  Omit<ComponentProps<typeof Button>, "render" | "nativeButton">;

/**
 * A Button that renders as a Next.js Link (<a> tag).
 * Uses Base UI's render prop + nativeButton={false} to avoid
 * the "expected native <button>" warning.
 */
export function ButtonLink({ href, children, ...props }: ButtonLinkProps) {
  return (
    <Button {...props} nativeButton={false} render={<Link href={href} />}>
      {children}
    </Button>
  );
}
