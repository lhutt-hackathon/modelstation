"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeftIcon, LogInIcon, SparklesIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";

type Mode = "login" | "register";

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
  const searchParams = useSearchParams();
  const { login, register, user, isReady } = useAuth();

  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isDemoShortcut = useMemo(() => searchParams.get("demo") === "true", [searchParams]);

  useEffect(() => {
    if (isDemoShortcut) {
      setEmail("demo@modelstation.ai");
      setPassword("modelstation");
    }
  }, [isDemoShortcut]);

  useEffect(() => {
    if (isReady && user) {
      router.replace("/workspace");
    }
  }, [isReady, router, user]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      if (mode === "login") {
        await login({ email, password });
        toast.success("Welcome back!", {
          description: "You’re signed in. Head to your workspace to see your portfolio."
        });
      } else {
        await register({ name, email, password });
        toast.success("Workspace created", {
          description: "We’ve spun up a new workspace just for you."
        });
      }
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
    toast.info("Demo credentials filled", {
      description: "Email: demo@modelstation.ai · Password: modelstation"
    });
  };

  return (
    <div className="relative flex min-h-[calc(100vh-80px)] items-center justify-center bg-background px-6 py-16">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-70">
        <div className="absolute -top-32 left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,_rgba(116,108,255,0.25)_0%,_rgba(58,182,255,0.12)_45%,_transparent_70%)] blur-3xl" />
        <div className="absolute bottom-20 right-12 h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle,_rgba(52,211,153,0.25)_0%,_transparent_70%)] blur-3xl" />
      </div>

      <div className="mx-auto flex w-full max-w-4xl flex-col gap-10 lg:flex-row">
        <Card className="flex-1 border border-border/70 bg-card/95 shadow-lg backdrop-blur">
          <CardHeader className="space-y-3">
            <Button asChild variant="ghost" size="sm" className="w-fit px-3 text-muted-foreground">
              <Link href="/">
                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                Back to site
              </Link>
            </Button>
            <CardTitle className="text-3xl font-semibold text-foreground">
              {mode === "login" ? "Welcome back" : "Create your workspace"}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {mode === "login"
                ? "Use your email address and password to access ModelStation."
                : "Spin up a sandboxed workspace so you can orchestrate model fine-tunes end-to-end."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              {mode === "register" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground" htmlFor="name">
                    Full name
                  </label>
                  <Input
                    id="name"
                    placeholder="Avery Steward"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                  />
                </div>
              )}

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
                  placeholder="Enter a secure password"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                <LogInIcon className="mr-2 h-4 w-4" />
                {mode === "login" ? "Log in" : "Create account"}
              </Button>
            </form>

            <div className="mt-6 grid gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={fillDemoAccount}
                className="w-full border-dashed text-sm text-muted-foreground"
              >
                <SparklesIcon className="mr-2 h-4 w-4 text-primary" />
                Autofill demo credentials
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Demo account · email: demo@modelstation.ai · password: modelstation
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="flex-1 border border-border/70 bg-background/60 p-6 shadow-inner">
          <CardHeader className="space-y-3">
            <CardTitle className="text-2xl font-semibold">Why sign in?</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Access a private workspace with your models, training briefs, and evaluation artifacts. Everything stays
              isolated to your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 text-sm text-muted-foreground">
            <div>
              <p className="font-medium text-foreground">Manage your portfolio</p>
              <p>Launch fine-tunes, scope the data runs that fuel them, and review evaluation outcomes from one dashboard.</p>
            </div>
            <div>
              <p className="font-medium text-foreground">Guardrailed access</p>
              <p>Workspace membership controls who can edit policies, training briefs, and deployment-ready checkpoints.</p>
            </div>
            <div>
              <p className="font-medium text-foreground">Stay audit ready</p>
              <p>Every fine-tune stores provenance metadata, evaluation deltas, and human review sign-offs.</p>
            </div>

            <div className="rounded-md border border-dashed border-primary/40 bg-primary/5 p-4 text-xs text-primary">
              Looking for enterprise SSO or SCIM provisioning? Reach out at{" "}
              <a className="underline" href="mailto:hello@modelstation.ai">
                hello@modelstation.ai
              </a>
              .
            </div>

            <div className="border-t border-border/60 pt-4 text-center">
              <button
                type="button"
                className="text-sm text-primary underline underline-offset-4"
                onClick={() => setMode(mode === "login" ? "register" : "login")}
              >
                {mode === "login" ? "Need an account? Create one." : "Already have an account? Log in."}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
