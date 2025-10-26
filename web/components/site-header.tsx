"use client";

import { useMemo } from "react";
import Link from "next/link";
import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";
import { ArrowRightIcon } from "lucide-react";

import { buttonVariants, Button } from "@/components/ui/button";
import { useUser } from "@/hooks/use-user";
import { cn } from "@/lib/utils";

type NavItem = {
  href: Route;
  label: string;
  match: RegExp;
};

const BASE_NAV: NavItem[] = [
  { href: "/", label: "Datasets", match: /^\/$/ },
  { href: "/models", label: "Models", match: /^\/models/ }
];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isReady } = useUser();

  const navItems = useMemo(() => {
    if (user) {
      return [...BASE_NAV, { href: "/workspace" as Route, label: "Workspace", match: /^\/workspace/ }];
    }
    return BASE_NAV;
  }, [user]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-6 py-4 lg:px-8">
        <Link
          href="/"
          className="text-xs font-semibold uppercase tracking-[0.4em] text-muted-foreground hover:text-foreground"
        >
          ModelStation
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const isActive = item.match.test(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-foreground/10 text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/models"
            className={cn(
              buttonVariants({ size: "sm" }),
              "hidden sm:inline-flex px-4"
            )}
          >
            Launch model studio
            <ArrowRightIcon className="ml-2 h-4 w-4" />
          </Link>

          {isReady ? (
            user ? (
              <div className="flex items-center gap-2">
                <span className="hidden text-sm text-muted-foreground sm:inline-block">
                  {user.name.split(" ")[0]}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="px-3"
                  onClick={handleLogout}
                >
                  Sign out
                </Button>
              </div>
            ) : (
              <Link
                href="/login"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "px-3")}
              >
                Log in
              </Link>
            )
          ) : null}
        </div>
      </div>
    </header>
  );
}
