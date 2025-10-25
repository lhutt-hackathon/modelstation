import Link from "next/link";
import {
  ArrowUpRightIcon,
  DatabaseIcon,
  GaugeCircleIcon,
  LayersIcon,
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
import { cn } from "@/lib/utils";

const modelPortfolio = [
  {
    name: "Atlas QA Compliance Copilot",
    domain: "Pharma QA & batch release",
    baseModel: "GPT-4.1 Enterprise",
    dataset: "Pharma Compliance QA v9",
    status: "Live",
    lastTrained: "3 days ago",
    metrics: ["98.2% rubric adherence", "37 sec MTTR delta"],
    highlights: ["Auto-summarises CAPA resolutions", "Cross-checks protocol clauses in 11 jurisdictions"]
  },
  {
    name: "AeroWave Flight Line Specialist",
    domain: "Aviation maintenance & AOG triage",
    baseModel: "Claude 3 Sonnet",
    dataset: "Aviation Maintenance Runbooks v4",
    status: "Pilot",
    lastTrained: "8 days ago",
    metrics: ["92.7% tool-call accuracy", "38% faster torque sequencing"],
    highlights: ["Pushes real-time task cards to AMOS", "Bilingual troubleshooting guidance"]
  },
  {
    name: "Sentinel Flow Surveillance Analyst",
    domain: "Capital markets risk & compliance",
    baseModel: "Mistral Large 2",
    dataset: "Trading Surveillance Escalations v6",
    status: "QA",
    lastTrained: "Yesterday",
    metrics: ["99.1% policy precision", "5.4% false positive reduction"],
    highlights: ["Structured SAR narratives", "Tier-1 escalation briefings with citations"]
  }
] as const;

const roadmapItems = [
  {
    title: "Underwriting synthesis pilot",
    eta: "Week of Oct 21",
    owner: "Insurance Ops",
    detail: "Fine-tune on 1.7M annotated claims & policy deltas to recommend coverage decisions with auditable factors."
  },
  {
    title: "Multilingual compliance expansion",
    eta: "Nov 4",
    owner: "RegOps",
    detail: "Extend Atlas QA Copilot with Spanish & Mandarin corpora plus region-specific policy guardrails."
  },
  {
    title: "Tool-grounded agentic workflows",
    eta: "Mid-Nov",
    owner: "Automation Guild",
    detail: "Introduce chained tool-calls for reconciliation, evidence gathering, and auto-ticket closure in ServiceNow."
  }
] as const;

const highlightStats = [
  {
    title: "Models in production",
    value: "14",
    description: "Live copilots maintained across pharma, aviation, finance, and operations playbooks.",
    icon: RocketIcon
  },
  {
    title: "Median fine-tune window",
    value: "11 days",
    description: "From scoping brief to deployment-ready checkpoint with human sign-off.",
    icon: GaugeCircleIcon
  },
  {
    title: "Reusable components",
    value: "63%",
    description: "Shared tool schemas, eval suites, and prompts reused across the portfolio.",
    icon: LayersIcon
  }
] as const;

const statusStyles: Record<string, string> = {
  Live: "bg-emerald-500/15 text-emerald-500",
  Pilot: "bg-sky-500/15 text-sky-500",
  QA: "bg-amber-500/15 text-amber-500"
};

export default function ModelsPage() {
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
              impact. ModelStation orchestrates every stage—from dataset pairing to evaluation sign-off—so you can iterate
              with confidence.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild className="px-6">
              <Link href="#create">Create new model</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/#pipeline">Review dataset pipeline</Link>
            </Button>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {highlightStats.map((stat) => (
            <Card key={stat.title} className="border border-border/70 bg-card/90 shadow-sm backdrop-blur">
              <CardHeader className="space-y-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-foreground/10 text-primary">
                  <stat.icon className="h-5 w-5" />
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
          ))}
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
                      <TableHead>Dataset</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last fine-tune</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {modelPortfolio.map((model) => (
                      <TableRow key={model.name}>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <span className="font-medium text-foreground">{model.name}</span>
                            <span className="text-xs text-muted-foreground">{model.metrics.join(" • ")}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{model.domain}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{model.baseModel}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <DatabaseIcon className="h-4 w-4 text-muted-foreground/70" />
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
                    ))}
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
                {modelPortfolio.map((model) => (
                  <div key={model.name} className="rounded-lg border border-border/60 bg-background/40 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{model.name.split(" ").slice(0, 2).join(" ")}</p>
                        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground/80">{model.status}</p>
                      </div>
                      <SparklesIcon className="h-4 w-4 text-primary" />
                    </div>
                    <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                      {model.highlights.map((highlight) => (
                        <li key={highlight} className="leading-relaxed">
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
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
                {roadmapItems.map((item) => (
                  <div key={item.title} className="rounded-lg border border-border/60 bg-background/40 p-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge variant="outline" className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                        {item.eta}
                      </Badge>
                      <span className="text-sm font-semibold text-foreground">{item.title}</span>
                      <span className="text-xs text-muted-foreground">Owner: {item.owner}</span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{item.detail}</p>
                  </div>
                ))}
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
                    <p className="text-sm font-medium text-foreground">Dataset-package hand-off guide</p>
                    <LayersIcon className="h-4 w-4 text-primary" />
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Walkthrough of how datasets, eval suites, and LoRA adapters move from staging to production.
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
