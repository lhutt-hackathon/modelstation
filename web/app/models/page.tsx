import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowUpRightIcon,
  GaugeCircleIcon,
  LayersIcon,
  NotebookPenIcon,
  RocketIcon,
  ShieldCheckIcon,
  SparklesIcon
} from "lucide-react";

import { CreateModelForm } from "@/components/models/create-model-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

// Force dynamic rendering since we need database access
export const dynamic = 'force-dynamic';

const statusStyles: Record<string, string> = {
  Live: "bg-emerald-500/15 text-emerald-500",
  Pilot: "bg-sky-500/15 text-sky-500",
  QA: "bg-amber-500/15 text-amber-500"
};

const highlightIconMap: Record<string, LucideIcon> = {
  RocketIcon,
  GaugeCircleIcon,
  LayersIcon
};

export default async function ModelsPage() {
  const [rawModels, roadmapItems, highlightRecords] = await Promise.all([
    prisma.model.findMany({ orderBy: { name: "asc" } }),
    prisma.roadmapItem.findMany({ orderBy: { eta: "asc" } }),
    prisma.highlightStat.findMany({ orderBy: { title: "asc" } })
  ]);

  // Parse JSON strings back to arrays
  const models = rawModels.map((model) => ({
    ...model,
    metrics: JSON.parse(model.metrics) as string[],
    highlights: JSON.parse(model.highlights) as string[],
  }));

  const highlightStats = highlightRecords.map((stat) => ({
    ...stat,
    icon: highlightIconMap[stat.iconKey] ?? SparklesIcon
  }));

  return (
    <div className="relative overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-80">
        <div className="absolute -top-48 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,_rgba(80,185,255,0.25)_0%,_rgba(112,46,255,0.1)_45%,_transparent_70%)] blur-3xl" />
        <div className="absolute left-16 top-80 h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle,_rgba(52,211,153,0.25)_0%,_transparent_70%)] blur-3xl" />
        <div className="absolute bottom-12 right-12 h-[440px] w-[440px] rounded-full bg-[radial-gradient(circle,_rgba(255,153,102,0.22)_0%,_transparent_60%)] blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-background via-background/85 to-transparent" />
      </div>

      <div className="mx-auto flex max-w-6xl flex-col gap-16 px-6 pb-24 pt-16 lg:px-8">
        <section className="space-y-10 text-center">
          <Badge
            variant="outline"
            className="mx-auto flex w-fit items-center gap-2 rounded-full border border-border/60 bg-background/70 px-5 py-2 text-xs font-medium uppercase tracking-[0.35em] text-muted-foreground"
          >
            Fine-tuned models ready for deployment
          </Badge>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Launch models that inherit your playbooks
            </h1>
            <p className="mx-auto max-w-3xl text-base text-muted-foreground">
              Spin up copilots that reason with your institutional knowledge, pass your guardrails, and deliver measurable
              impact. ModelStation orchestrates every stage—from scoping the right data for each model to evaluation
              sign-off—so you can iterate with confidence.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild className="px-6">
              <Link href="#create">Create new model</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/workspace#pipeline">Review training runbook</Link>
            </Button>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {highlightStats.length > 0 ? (
            highlightStats.map((stat) => {
              const Icon = stat.icon;

              return (
                <Card key={stat.id} className="border border-border/70 bg-card/90 shadow-sm backdrop-blur">
                  <CardHeader className="space-y-4">
                    <span className="flex h-10 w-10 items-center justify-center rounded-md bg-foreground/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <CardTitle className="text-2xl font-semibold">{stat.value}</CardTitle>
                      <CardDescription className="text-sm text-muted-foreground">{stat.title}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">{stat.description}</p>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card className="md:col-span-3 border border-border/70 bg-card/90 shadow-sm backdrop-blur">
              <CardHeader className="space-y-2">
                <CardTitle className="text-xl font-semibold">No highlights yet</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Seed the database to showcase production metrics across your model portfolio.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Run <code>npm run db:seed</code> after pushing the schema to populate the default highlight cards.
                </p>
              </CardContent>
            </Card>
          )}
        </section>

        <Tabs defaultValue="portfolio" className="space-y-10">
          <TabsList className="mx-auto flex w-full max-w-lg justify-center bg-card/80">
            <TabsTrigger value="portfolio">Model portfolio</TabsTrigger>
            <TabsTrigger value="new">Create model</TabsTrigger>
            <TabsTrigger value="roadmap">Experiments roadmap</TabsTrigger>
          </TabsList>

          <TabsContent value="portfolio" className="space-y-8">
            <Card className="border border-border/70 bg-card shadow-sm">
              <CardHeader>
                <CardTitle>Live models</CardTitle>
                <CardDescription>Curated checkpoints that have cleared governance and are currently serving users.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Model</TableHead>
                      <TableHead>Domain</TableHead>
                      <TableHead>Base model</TableHead>
                      <TableHead>Training data brief</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last fine-tune</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {models.length > 0 ? (
                      models.map((model) => (
                        <TableRow key={model.id}>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <span className="font-medium text-foreground">{model.name}</span>
                              {model.metrics.length > 0 ? (
                                <span className="text-xs text-muted-foreground">{model.metrics.join(" • ")}</span>
                              ) : null}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{model.domain}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{model.baseModel}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <NotebookPenIcon className="h-4 w-4 text-muted-foreground/70" />
                              {model.dataset}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={cn(
                                "border-none px-2 py-1 text-xs font-medium",
                                statusStyles[model.status] ?? "bg-muted text-muted-foreground"
                              )}
                            >
                              {model.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{model.lastTrained}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                          No models found. Push the schema and seed data to explore the sample portfolio.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                  <TableCaption>
                    Explore run histories and evaluation artifacts inside each model card. Guardrail deltas are archived
                    for audit review.
                  </TableCaption>
                </Table>
              </CardContent>
            </Card>

            <Card className="border border-border/70 bg-card shadow-sm">
              <CardHeader>
                <CardTitle>Highlights</CardTitle>
                <CardDescription>Key behaviors these copilots have unlocked inside enterprise workflows.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-3">
                {models.length > 0 ? (
                  models.map((model) => (
                    <div key={model.id} className="rounded-lg border border-border/60 bg-background/40 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {model.name.split(" ").slice(0, 2).join(" ")}
                          </p>
                          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground/80">{model.status}</p>
                        </div>
                        <SparklesIcon className="h-4 w-4 text-primary" />
                      </div>
                      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                        {model.highlights.length > 0 ? (
                          model.highlights.map((highlight) => (
                            <li key={highlight} className="leading-relaxed">
                              {highlight}
                            </li>
                          ))
                        ) : (
                          <li className="leading-relaxed text-muted-foreground/70">No highlight summary yet.</li>
                        )}
                      </ul>
                    </div>
                  ))
                ) : (
                  <div className="md:col-span-3 rounded-lg border border-border/60 bg-background/40 p-6 text-sm text-muted-foreground">
                    Create or seed models to surface their signature workflows in this section.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="new" id="create">
            <CreateModelForm />
          </TabsContent>

          <TabsContent value="roadmap" className="space-y-8">
            <Card className="border border-border/70 bg-card shadow-sm">
              <CardHeader>
                <CardTitle>Upcoming experiments</CardTitle>
                <CardDescription>Coordinated fine-tunes and feature upgrades currently in the queue.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {roadmapItems.length > 0 ? (
                  roadmapItems.map((item) => (
                    <div key={item.id} className="rounded-lg border border-border/60 bg-background/40 p-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <Badge variant="outline" className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                          {item.eta}
                        </Badge>
                        <span className="text-sm font-semibold text-foreground">{item.title}</span>
                        <span className="text-xs text-muted-foreground">Owner: {item.owner}</span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{item.detail}</p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-lg border border-border/60 bg-background/40 p-4 text-sm text-muted-foreground">
                    No roadmap entries yet. Seed or create upcoming experiments to track launch timelines.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border border-border/70 bg-card shadow-sm">
              <CardHeader>
                <CardTitle>Enablement resources</CardTitle>
                <CardDescription>Everything stakeholders need to green-light the next wave of pilots.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-border/60 bg-background/40 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">Model evaluation rubric</p>
                    <ShieldCheckIcon className="h-4 w-4 text-primary" />
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Step-by-step criteria for human sign-off, aligned with governance and policy requirements.
                  </p>
                  <Button variant="ghost" className="mt-3 h-auto px-0 text-sm font-medium text-primary">
                    View rubric
                    <ArrowUpRightIcon className="ml-1 h-4 w-4" />
                  </Button>
                </div>

                <div className="rounded-lg border border-border/60 bg-background/40 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">Training pipeline hand-off guide</p>
                    <LayersIcon className="h-4 w-4 text-primary" />
                  </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Walkthrough of how model-specific data runs, eval suites, and LoRA adapters move from staging to
                      production.
                  </p>
                  <Button variant="ghost" className="mt-3 h-auto px-0 text-sm font-medium text-primary">
                    Browse guide
                    <ArrowUpRightIcon className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
