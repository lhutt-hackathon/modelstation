import Link from "next/link";

import {
  ActivityIcon,
  ArrowRightIcon,
  BadgeCheckIcon,
  FactoryIcon,
  MicroscopeIcon,
  ShieldCheckIcon
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const featureHighlights = [
  {
    title: "Operator-grade intake",
    description:
      "Intake templates capture objectives, policies, and success metrics before any training run begins.",
    icon: ActivityIcon
  },
  {
    title: "Data runs scoped per model",
    description:
      "Each fine-tune spins up a dedicated data pipeline so training corpora never bleed across domains.",
    icon: MicroscopeIcon
  },
  {
    title: "Governed deployment loops",
    description:
      "Guardrails, evaluation suites, and rollout playbooks ship alongside every checkpoint.",
    icon: ShieldCheckIcon
  }
] as const;

const fineTunePhases = [
  {
    title: "Model intake",
    detail:
      "Codify objectives, risk surfaces, stakeholders, and success metrics so every downstream artifact ties to the right outcomes.",
    metric: "Intake complete in 48 hours on average."
  },
  {
    title: "Dedicated data run",
    detail:
      "Source, synthesize, and QA examples exclusively for this model. We enforce policy guardrails and provenance on every sample.",
    metric: "3.1M curated interactions delivered per run."
  },
  {
    title: "Training loop",
    detail:
      "Execute LoRA or full fine-tunes, monitor gradients in-flight, and benchmark deltas against negotiated success criteria.",
    metric: "Median fine-tune window: 11 days."
  },
  {
    title: "Evaluation & release",
    detail:
      "Ship multi-layer evaluations, human review sign-offs, and rollout rehearsals before the checkpoint touches production.",
    metric: "100% of launches include human-in-the-loop QA."
  }
] as const;

const industryPlaybooks = [
  {
    label: "Pharma QA & compliance",
    summary:
      "Augment regulatory teams with assistants that reason over molecule libraries, protocol deviations, and jurisdictional clauses.",
    outcomes: [
      "Auto-translate CAPA workflows into correct actions by region.",
      "Validate clinical narratives against trial registries in seconds.",
      "Summarize inspection readiness with evidence citations."
    ],
    icon: ActivityIcon
  },
  {
    label: "Aviation maintenance orchestration",
    summary:
      "Codify troubleshooting patterns, manufacturer bulletins, and AOG crisis procedures into turn-by-turn copilots for technicians.",
    outcomes: [
      "Reduce hangar-floor diagnostics by 38% with lineage-aware instructions.",
      "Cross-check torque specs and sequencing against fleet history.",
      "Issue compliance sign-offs with embedded authority references."
    ],
    icon: FactoryIcon
  },
  {
    label: "Trading risk & surveillance",
    summary:
      "Teach models to flag exposure anomalies, policy violations, and anti-patterns across multi-market order flow.",
    outcomes: [
      "Detect wash trades and spoofing signatures in near real time.",
      "Explain policy breaches with annotated regulatory excerpts.",
      "Generate remediation playbooks tailored to desk protocols."
    ],
    icon: ShieldCheckIcon
  }
] as const;

const trainingStats = [
  {
    columnOne: "Intake to launch",
    columnTwo: "11.2 days",
    columnThree: "Includes bespoke data run, training cycles, and evaluation gates."
  },
  {
    columnOne: "Average curated records",
    columnTwo: "3.1M samples",
    columnThree: "Structured across dialogues, tool calls, evaluator prompts, and policy injects."
  },
  {
    columnOne: "Precision review rate",
    columnTwo: "97.4%",
    columnThree: "Triple-pass adjudication plus contradiction sweeps on critical paths."
  },
  {
    columnOne: "Human QA sign-off",
    columnTwo: "100%",
    columnThree: "Every launch packages reviewer notes and provenance receipts."
  }
] as const;

const modelStudioHighlights = [
  {
    title: "Production copilots",
    description: "Launch fine-tuned models with full evaluation history, deployment playbooks, and governance artifacts.",
    icon: BadgeCheckIcon
  },
  {
    title: "Guardrailed by default",
    description:
      "Policy packs, data exclusions, and jurisdictional guardrails follow the model from intake through deployment.",
    icon: ShieldCheckIcon
  },
  {
    title: "Fast iteration loops",
    description:
      "One-click retraining spins up fresh data runs, benchmarks deltas, and notifies stakeholders before release.",
    icon: ActivityIcon
  }
] as const;

const faqEntries = [
  {
  question: "How bespoke is the training data per model?",
    answer:
      "Every engagement is grounded in your proprietary material, error clips, and real transaction history. Runs stay siloed—each corpus is isolated, encrypted, and purged once the model ships."
  },
  {
    question: "Do you fine-tune the model too?",
    answer:
      "Yes. Intake triggers a full pipeline: scoped data run, training loop, evaluation stack, and readiness review. You get a deployable checkpoint with all supporting artifacts."
  },
  {
    question: "What about governance and traceability?",
    answer:
      "Every sample ships with provenance metadata, policy compliance tags, and reviewer signatures. Auditors can trace any model output back to the exact prompt lineage."
  }
] as const;

export default function Page() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-80">
        <div className="absolute -top-32 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,_rgba(121,93,255,0.55)_0%,_rgba(87,203,255,0.18)_40%,_transparent_72%)] blur-3xl" />
        <div className="absolute left-12 top-52 h-[340px] w-[340px] rounded-full bg-[radial-gradient(circle,_rgba(69,219,202,0.35)_0%,_rgba(255,184,108,0.18)_55%,_transparent_75%)] blur-3xl" />
        <div className="absolute bottom-8 right-16 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,_rgba(245,107,167,0.28)_0%,_transparent_65%)] blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-background via-background/85 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-20 px-6 pb-24 pt-20 lg:px-8">
        <header className="space-y-10 text-center">
          <Badge
            variant="outline"
            className="mx-auto flex w-fit items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-5 py-2 text-xs font-medium uppercase tracking-[0.35em] text-primary"
          >
            Model operations without guesswork
          </Badge>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Fine-tune copilots with data built just for them
            </h1>
            <p className="mx-auto max-w-3xl text-base text-muted-foreground">
              ModelStation runs the full stack for enterprise fine-tuning. Each model gets its own data run, guardrails,
              and evaluation harness—packaged with the governance artifacts your stakeholders demand.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Button className="px-6">
              Book a scoping call
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Button>
            <Button asChild variant="ghost">
              <Link href="/models">Explore model studio</Link>
            </Button>
            <Button variant="outline">Download fine-tune checklist</Button>
          </div>
        </header>

        <section className="space-y-10">
          <div className="grid gap-6 md:grid-cols-3">
            {featureHighlights.map((feature) => (
              <Card
                key={feature.title}
                className="border border-border/60 bg-gradient-to-br from-card/95 via-card/90 to-primary/10 shadow-lg shadow-primary/10"
              >
                <CardHeader className="space-y-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-md bg-foreground/10 text-primary">
                    <feature.icon className="h-5 w-5" />
                  </span>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="pipeline" className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
          <Card className="border border-border/60 bg-gradient-to-br from-card/95 via-card/90 to-accent/10 shadow-lg shadow-accent/10">
            <CardHeader>
              <CardTitle>Our fine-tune pipeline</CardTitle>
              <CardDescription>
                A four-stage runbook purpose-built to deliver model-specific data, checkpoints, and evaluation artifacts.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {fineTunePhases.map((phase, index) => (
                <div key={phase.title} className="rounded-lg border border-border/60 bg-background/30 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                        Phase {index + 1}
                      </p>
                      <h3 className="text-lg font-semibold text-foreground">{phase.title}</h3>
                    </div>
                    <Badge variant="outline" className="text-xs text-muted-foreground">
                      {phase.metric}
                    </Badge>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{phase.detail}</p>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="border border-border/60 bg-gradient-to-br from-card/95 via-card/90 to-primary/10 shadow-md shadow-primary/10">
            <CardHeader>
              <CardTitle>Compliance scaffolding</CardTitle>
              <CardDescription>
                Every training run is prepared for audits, security reviews, and on-prem deployment from day zero.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">Immutable provenance</p>
                <p className="text-sm text-muted-foreground">
                  Lineage metadata, review trails, and consent tags are attached to each sample to meet regulatory
                  expectations across finance, healthcare, and public sector.
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">Policy firewalls</p>
                <p className="text-sm text-muted-foreground">
                  Safety classifiers, prohibited-topic filters, and brand guardrails are embedded directly in the corpus,
                  reducing moderation overhead during deployment.
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">Segregated delivery</p>
                <p className="text-sm text-muted-foreground">
                  Data is encrypted at rest, transferred over mutually authenticated channels, and wiped post hand-off. No
                  multi-tenant storage—ever.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-10">
          <Tabs defaultValue="playbooks" className="w-full">
            <TabsList className="mb-6 bg-card/70 backdrop-blur">
              <TabsTrigger value="playbooks">Industry playbooks</TabsTrigger>
              <TabsTrigger value="metrics">Training metrics</TabsTrigger>
            </TabsList>
            <TabsContent value="playbooks">
              <div className="grid gap-6 md:grid-cols-3">
                {industryPlaybooks.map((playbook) => (
                  <Card
                    key={playbook.label}
                    className="border border-border/60 bg-gradient-to-br from-card/95 via-card/90 to-secondary/10 shadow-md shadow-secondary/10"
                  >
                    <CardHeader className="space-y-4">
                      <span className="flex h-10 w-10 items-center justify-center rounded-md bg-foreground/10 text-primary">
                        <playbook.icon className="h-5 w-5" />
                      </span>
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{playbook.label}</CardTitle>
                        <CardDescription className="text-sm text-muted-foreground">
                          {playbook.summary}
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        {playbook.outcomes.map((outcome) => (
                          <li key={outcome} className="flex items-start gap-2">
                            <BadgeCheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                            <span>{outcome}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="metrics">
              <Card className="border border-border/60 bg-gradient-to-br from-card/95 via-card/90 to-primary/10 shadow-md shadow-primary/10">
                <CardHeader>
                  <CardTitle>Delivery profile</CardTitle>
                  <CardDescription>
                    Benchmarks captured across the last twelve enterprise fine-tunes pushed to clients.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Segment</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {trainingStats.map((stat) => (
                        <TableRow key={stat.columnOne}>
                          <TableCell className="font-medium text-foreground">{stat.columnOne}</TableCell>
                          <TableCell>{stat.columnTwo}</TableCell>
                          <TableCell>{stat.columnThree}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </section>

        <section className="space-y-10">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <Badge variant="outline" className="w-fit text-xs uppercase tracking-[0.3em] border-primary/40 bg-primary/10 text-primary">
              Model studio
            </Badge>
            <div className="space-y-3">
              <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                From intake to deployed model — all in one workspace
              </h2>
              <p className="max-w-2xl text-sm text-muted-foreground">
                Intake requests, scoped data runs, fine-tunes, and evaluations stay linked inside ModelStation. You see
                every artifact that lands in production—and the lineage that gets it there.
              </p>
            </div>
            <Button asChild className="px-6">
              <Link href="/models">Go to model studio</Link>
            </Button>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {modelStudioHighlights.map((highlight) => (
              <Card
                key={highlight.title}
                className="border border-border/60 bg-gradient-to-br from-card/95 via-card/90 to-accent/10 shadow-lg shadow-accent/10"
              >
                <CardHeader className="space-y-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-md bg-foreground/10 text-primary">
                    <highlight.icon className="h-5 w-5" />
                  </span>
                  <CardTitle className="text-lg">{highlight.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm text-muted-foreground leading-relaxed">
                    {highlight.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="space-y-8">
          <Separator className="bg-border/40" />
          <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
            <Card className="border border-border/60 bg-gradient-to-br from-card/95 via-card/90 to-secondary/10 shadow-lg shadow-secondary/15">
              <CardHeader>
                <CardTitle>Why we over-deliver on specificity</CardTitle>
                <CardDescription>
                  Enterprise systems demand relentless accuracy. We thrive where generic data sourcing fails.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border border-border/60 bg-background/30 p-4">
                  <p className="text-sm font-semibold text-foreground">Expert stewards in the loop</p>
                  <p className="text-sm text-muted-foreground">
                    Domain specialists pair with our agents to refine prompts, purge hallucinations, and notarize every
                    label before it lands in your corpus.
                  </p>
                </div>
                <div className="rounded-lg border border-border/60 bg-background/30 p-4">
                  <p className="text-sm font-semibold text-foreground">Task graph coverage analytics</p>
                  <p className="text-sm text-muted-foreground">
                    Coverage models ensure no decision branch gets under-sampled. Expect reward shaping guidance and
                    targeted augmentations to deter catastrophic forgetting.
                  </p>
                </div>
                <div className="rounded-lg border border-border/60 bg-background/30 p-4">
                  <p className="text-sm font-semibold text-foreground">Fine-tune ready packaging</p>
                  <p className="text-sm text-muted-foreground">
                    Shipments include JSONL, Parquet, and vectorized variants, LoRA-compatible configs, and curated eval
                    suites to slot directly into your training stack.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border/60 bg-gradient-to-br from-card/95 via-card/90 to-primary/10 shadow-lg shadow-primary/10">
              <CardHeader>
                <CardTitle>Frequently asked</CardTitle>
                <CardDescription>
                  Straight answers so your stakeholders can green-light surgical tuning.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Accordion type="single" collapsible className="space-y-3">
                  {faqEntries.map((faq, index) => (
                    <AccordionItem
                      key={faq.question}
                      value={`faq-${index}`}
                      className="rounded-lg border border-border/60 bg-background/30"
                    >
                      <AccordionTrigger className="rounded-lg px-4 py-3 text-sm font-medium">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground">{faq.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </div>
        </section>

        <Card className="border border-border/60 bg-gradient-to-br from-card/95 via-card/90 to-primary/10 shadow-lg shadow-primary/10">
          <CardContent className="flex flex-col gap-6 px-8 py-9 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3">
              <Badge variant="outline" className="w-fit text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Ready to brief us
              </Badge>
              <div className="space-y-2">
                <CardTitle className="text-2xl font-semibold">Bring us your most unforgiving workflow</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  In a 45 minute session we will surface the task graph, align on constraints, and deliver a scoping plan
                  for the fine-tune your model deserves.
                </CardDescription>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="ghost">
                <Link href="/models">Launch model studio</Link>
              </Button>
              <Button variant="ghost">Review security posture</Button>
              <Button className="px-6">
                Schedule a scoping call
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
