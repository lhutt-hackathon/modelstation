"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, LogInIcon, SparklesIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useUser } from "@/hooks/use-user";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-background">
          <p className="text-sm text-muted-foreground">Loading sign-in…</p>
        </div>
      }
    >
      <LoginView />
    </Suspense>
  );
}

function LoginView() {
  const router = useRouter();
  const { login, user, isReady } = useUser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isReady && user) {
      router.replace("/workspace");
    }
  }, [isReady, router, user]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await login({ email, password });
      toast.success("Welcome back!", {
        description: "You're signed in. Head to your workspace to see your portfolio."
      });
      router.replace("/workspace");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong. Please try again.";
      toast.error("Unable to continue", { description: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemoAccount = () => {
    setEmail("demo@modelstation.ai");
    setPassword("modelstation");
    toast.info("Demo credentials filled");
  };

  return (
    <div className="relative flex min-h-[calc(100vh-80px)] items-center justify-center bg-background px-6 py-16">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-70">
        <div className="absolute -top-32 left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,_rgba(121,93,255,0.5)_0%,_rgba(87,203,255,0.2)_45%,_transparent_72%)] blur-3xl" />
        <div className="absolute bottom-20 right-12 h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle,_rgba(69,219,202,0.32)_0%,_rgba(245,107,167,0.24)_60%,_transparent_78%)] blur-3xl" />
      </div>

      <div className="mx-auto w-full max-w-md">
        <Card className="border border-border/60 bg-gradient-to-br from-card/95 via-card/90 to-primary/10 shadow-xl shadow-primary/15 backdrop-blur">
          <CardHeader className="space-y-3">
            <Button asChild variant="ghost" size="sm" className="w-fit px-3 text-muted-foreground">
              <Link href="/">
                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                Back to site
              </Link>
            </Button>
            <CardTitle className="text-3xl font-semibold text-foreground">Welcome back</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Sign in to access your ModelStation workspace
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground" htmlFor="email">
                  Email address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground" htmlFor="password">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                <LogInIcon className="mr-2 h-4 w-4" />
                Log in
              </Button>
            </form>

            <div className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={fillDemoAccount}
                className="w-full border-dashed text-sm"
              >
                <SparklesIcon className="mr-2 h-4 w-4 text-primary" />
                Use demo account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
