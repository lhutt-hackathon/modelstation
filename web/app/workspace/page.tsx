"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowRightIcon, NotebookPenIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";

const pipelineStages = [
  {
    label: "Scope & intent",
    summary:
      "Capture the objective narrative, policy constraints, and target metrics for the upcoming fine-tune.",
    handoff: "Shared intake doc, governance checklist"
  },
  {
    label: "Data distillation",
    summary:
      "Spin up a dedicated data run for this model. We source, synthesize, and QA examples aligned to the scoped behaviors.",
    handoff: "Curated JSONL/Parquet package with provenance"
  },
  {
    label: "Training loop",
    summary:
      "Execute LoRA / full fine-tunes, monitor gradients, and benchmark deltas against your success criteria.",
    handoff: "Candidate checkpoints, evaluation deltas"
  },
  {
    label: "Sign-off & deploy",
    summary:
      "Run human review, policy gates, and rollout rehearsals before promoting the model to production surfaces.",
    handoff: "Launch report, rollout checklist"
  }
] as const;

export default function WorkspacePage() {
  const { user, isReady } = useAuth();

  const sortedModels = useMemo(() => {
    if (!user) return [];
    return [...user.models].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [user]);

  if (!isReady) {
    return (
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Preparing your workspace…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="relative flex min-h-[calc(100vh-80px)] items-center justify-center bg-background px-6 py-16">
        <div className="max-w-md rounded-xl border border-border/70 bg-card p-10 text-center shadow-sm">
          <NotebookPenIcon className="mx-auto mb-4 h-8 w-8 text-primary" />
          <h1 className="text-2xl font-semibold text-foreground">Sign in to access your workspace</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your fine-tuned models, evaluation runs, and launch playbooks live here. Use the demo account or create your
            own to explore.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Button asChild className="w-full">
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/login?demo=true">Use the demo account</Link>
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Demo credentials — email: <span className="font-medium text-foreground">demo@modelstation.ai</span> · password:{" "}
            <span className="font-medium text-foreground">modelstation</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-70">
        <div className="absolute -top-40 left-1/2 h-[480px] w-[520px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,_rgba(58,182,255,0.2)_0%,_rgba(116,108,255,0.1)_45%,_transparent_70%)] blur-3xl" />
        <div className="absolute bottom-16 right-16 h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle,_rgba(255,153,102,0.22)_0%,_transparent_60%)] blur-3xl" />
      </div>

      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 pb-24 pt-16 lg:px-8">
        <section className="space-y-6">
          <Badge variant="outline" className="w-fit text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Workspace
          </Badge>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Welcome back, {user.name.split(" ")[0]}
            </h1>
            <p className="max-w-3xl text-sm text-muted-foreground">
              Monitor fine-tunes, spin up scoped data runs for each model, and share evaluation artifacts across your
              teams. Every action here is contained to your workspace and audited for governance.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild className="px-6">
              <Link href="/models">
                Launch a new fine-tune
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="ghost" className="px-6">
              <Link href="#pipeline">Review training runbook</Link>
            </Button>
          </div>
        </section>

        <Tabs defaultValue="models" className="space-y-8">
          <TabsList className="w-full max-w-lg bg-card/80">
            <TabsTrigger value="models">My fine-tunes</TabsTrigger>
            <TabsTrigger value="pipeline">Runbook</TabsTrigger>
          </TabsList>

          <TabsContent value="models" className="space-y-6">
            <Card className="border border-border/70 bg-card shadow-sm">
              <CardHeader>
                <CardTitle>Your fine-tuned models</CardTitle>
                <CardDescription>
                  Track the status, guardrails, and objectives for every model you’ve launched through ModelStation.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Model</TableHead>
                      <TableHead>Base model</TableHead>
                      <TableHead>Training data brief</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedModels.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                          No models yet. Launch your first fine-tune to populate this table.
                        </TableCell>
                      </TableRow>
                    ) : (
                      sortedModels.map((model) => (
                        <TableRow key={model.id}>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <span className="font-medium text-foreground">{model.name}</span>
                              <span className="text-xs text-muted-foreground">
                                Guardrails: {model.guardrailsEnabled ? "Enabled" : "Disabled"} · Dry run:{" "}
                                {model.dryRun ? "Yes" : "No"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{model.baseModel}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <NotebookPenIcon className="h-4 w-4 text-muted-foreground/70" />
                              {model.dataset}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className="border-none bg-primary/10 text-xs font-medium uppercase tracking-wide text-primary">
                              {model.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(
                              new Date(model.updatedAt)
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>

                {sortedModels.length > 0 && (
                  <div className="rounded-lg border border-border/60 bg-background/40 p-4 text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">Latest objective</p>
                    <p>{sortedModels[0].objective}</p>
                    <p className="mt-2">
                      Success criteria: <span className="font-medium text-foreground">{sortedModels[0].successCriteria}</span>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pipeline" className="space-y-6" id="pipeline">
            <Card className="border border-border/70 bg-card shadow-sm">
              <CardHeader>
                <CardTitle>Fine-tune runbook</CardTitle>
                <CardDescription>
                  Each fine-tune spins up a model-specific data pipeline. Here’s how the workstreams line up from intake
                  to deployment.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                {pipelineStages.map((stage, index) => (
                  <div
                    key={stage.label}
                    className="rounded-lg border border-border/60 bg-background/40 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <Badge variant="outline" className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                        Stage {index + 1}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{stage.handoff}</span>
                    </div>
                    <p className="mt-3 text-sm font-semibold text-foreground">{stage.label}</p>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{stage.summary}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border border-border/70 bg-card shadow-sm">
              <CardHeader>
                <CardTitle>What "data per model" means</CardTitle>
                <CardDescription>
                  No shared corpora. Every training run receives a bespoke corpus and evaluation harness scoped to that
                  model's objectives.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <div className="rounded-lg border border-border/60 bg-background/40 p-4">
                  <p className="font-medium text-foreground">Exclusive data lineage</p>
                  <p>
                    Source material, synthetic augmentations, and annotations stay tied to a single model. Provenance is
                    logged so auditors can trace any output back to the exact scenario.
                  </p>
                </div>
                <div className="rounded-lg border border-border/60 bg-background/40 p-4">
                  <p className="font-medium text-foreground">Evaluation ready hand-offs</p>
                  <p>
                    Training briefs arrive packaged with policy tests, regression suites, and review templates so the same
                    artifacts fuel training and sign-off.
                  </p>
                </div>
                <div className="rounded-lg border border-border/60 bg-background/40 p-4">
                  <p className="font-medium text-foreground">Faster iteration loops</p>
                  <p>
                    Updates to a model regenerate its data slice automatically. You capture deltas in both the data run
                    and resulting checkpoints.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
