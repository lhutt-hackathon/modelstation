import Link from "next/link";

import {
  ActivityIcon,
  ArrowRightIcon,
  BadgeCheckIcon,
  DatabaseIcon,
  FactoryIcon,
  LineChartIcon,
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
    title: "Datasets engineered for 20M+ parameter mastery",
    description:
      "We synthesize dense, high-signal corpora that saturate every parameter with examples mapped to your exact operating constraints.",
    icon: DatabaseIcon
  },
  {
    title: "Precision labels from domain intelligence",
    description:
      "Every task is annotated with proprietary heuristics, human-in-the-loop adjudication, and contradiction sweeps to eradicate ambiguity.",
    icon: MicroscopeIcon
  },
  {
    title: "Guarantees on transfer and impact",
    description:
      "Dataset briefs ship with performance forecasts, safety deltas, and uplift projections so your fine-tune ROI is measurable before the first epoch.",
    icon: LineChartIcon
  }
] as const;

const pipelinePhases = [
  {
    title: "Signal harvesting",
    detail:
      "Mine institutional wikis, SOPs, transcripts, and error logs. Our agents normalize domain jargon and detect latent task archetypes.",
    metric: "26 content streams aggregated per engagement."
  },
  {
    title: "Scenario explosion",
    detail:
      "Generate adversarial dialogues, edge-case prompts, and conflicting intents to stress every branch of the task graph.",
    metric: "7.5M distilled interactions per deployment on average."
  },
  {
    title: "Label enforcement",
    detail:
      "Apply deterministic rule engines, human stewards, and contradiction sweeps to enforce one canonical resolution per scenario.",
    metric: "97.2% agreement across triple-pass adjudication."
  },
  {
    title: "Simulation & vetting",
    detail:
      "Pass datasets through policy firewalls, safety classifiers, and synthetic runs against base checkpoints to predict gradient behavior.",
    metric: "Performance delta forecasted ±1.3% error."
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

const datasetStats = [
  {
    columnOne: "Median dataset volume",
    columnTwo: "22.6M structured sequences",
    columnThree: "Balanced across prompt, dialogue, tool-call, and evaluator layers."
  },
  {
    columnOne: "Gold-label coverage",
    columnTwo: "92.4%",
    columnThree: "Human-verified or heuristic-backed outcomes per scenario."
  },
  {
    columnOne: "Task diversity index",
    columnTwo: "0.81",
    columnThree: "Shannon entropy across micro-task taxonomies."
  },
  {
    columnOne: "Safety & policy injects",
    columnTwo: "1.4M stress tests",
    columnThree: "Red-teamed prompts spanning abuse, compliance, and brand guardrails."
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
      "Policy packs and jurisdictional guardrails carry over from your dataset brief, so every response ships compliant.",
    icon: ShieldCheckIcon
  },
  {
    title: "Fast iteration loops",
    description:
      "One-click retraining spins up new checkpoints, benchmarks deltas, and notifies stakeholders before release.",
    icon: ActivityIcon
  }
] as const;

const faqEntries = [
  {
  question: "How bespoke are the datasets?",
    answer:
      "Every engagement is grounded in your proprietary material, error clips, and real transaction history. We never cross-contaminate domains—each dataset is isolated, encrypted, and purged post-delivery."
  },
  {
    question: "Do you fine-tune the model too?",
    answer:
      "We hand the dataset off with tuning briefs, eval suites, and LoRA recipes. If you need us to run the training loop we can coordinate, but our sweet spot is providing the ultra-specific data foundation."
  },
  {
    question: "What about governance and traceability?",
    answer:
      "Every sample ships with provenance metadata, policy compliance tags, and reviewer signatures. Auditors can trace any generated output back to the exact prompt lineage."
  }
] as const;

export default function Page() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-80">
        <div className="absolute -top-32 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,_rgba(116,108,255,0.28)_0%,_rgba(58,182,255,0.1)_45%,_transparent_70%)] blur-3xl" />
        <div className="absolute left-12 top-52 h-[340px] w-[340px] rounded-full bg-[radial-gradient(circle,_rgba(52,211,153,0.25)_0%,_transparent_70%)] blur-3xl" />
        <div className="absolute bottom-8 right-16 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,_rgba(99,102,241,0.22)_0%,_transparent_60%)] blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-background via-background/85 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-20 px-6 pb-24 pt-20 lg:px-8">
        <header className="space-y-10 text-center">
          <Badge
            variant="outline"
            className="mx-auto flex w-fit items-center gap-2 rounded-full border border-border/60 bg-background/70 px-5 py-2 text-xs font-medium uppercase tracking-[0.35em] text-muted-foreground"
          >
            Dataset orchestration for surgical fine-tuning
          </Badge>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              [placeholder]
            </h1>
            <p className="mx-auto max-w-3xl text-base text-muted-foreground">
              We build 20+ million parameter datasets that let enterprises fine-tune ultra-specific models capable of
              automating the tasks nobody else can touch. No generic corpora—only surgically precise training fuel.
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
            <Button variant="outline">Download dataset brief</Button>
          </div>
        </header>

        <section className="space-y-10">
          <div className="grid gap-6 md:grid-cols-3">
            {featureHighlights.map((feature) => (
              <Card key={feature.title} className="border border-border/70 bg-card shadow-sm">
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
          <Card className="border border-border/70 bg-card shadow-sm">
            <CardHeader>
              <CardTitle>Our dataset pipeline</CardTitle>
              <CardDescription>
                A four-stage system purpose-built to deliver ultra-specific coverage for high-stakes automation.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {pipelinePhases.map((phase, index) => (
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
          <Card className="border border-border/70 bg-card shadow-sm">
            <CardHeader>
              <CardTitle>Compliance scaffolding</CardTitle>
              <CardDescription>
                Every dataset is prepared for audits, security reviews, and on-prem deployment from day zero.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">Immutable provenance</p>
                <p className="text-sm text-muted-foreground">
                  Lineage metadata, review trails, and consent tags are attached to each row to meet regulatory
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
            <TabsList className="mb-6 bg-card/80">
              <TabsTrigger value="playbooks">Industry playbooks</TabsTrigger>
              <TabsTrigger value="metrics">Dataset metrics</TabsTrigger>
            </TabsList>
            <TabsContent value="playbooks">
              <div className="grid gap-6 md:grid-cols-3">
                {industryPlaybooks.map((playbook) => (
                  <Card key={playbook.label} className="border border-border/70 bg-card shadow-sm">
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
              <Card className="border border-border/70 bg-card shadow-sm">
                <CardHeader>
                  <CardTitle>Delivery profile</CardTitle>
                  <CardDescription>
                    Benchmarks captured across the last twelve enterprise datasets pushed to clients.
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
                      {datasetStats.map((stat) => (
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
            <Badge variant="outline" className="w-fit text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Model studio
            </Badge>
            <div className="space-y-3">
              <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                From dataset to deployed model – all in one workspace
              </h2>
              <p className="max-w-2xl text-sm text-muted-foreground">
                When your dataset lands, spin up a governed fine-tune, enforce guardrails, and ship a production-ready
                copilot without leaving ModelStation. The studio reuses every evaluation, prompt, and policy artifact we
                craft together.
              </p>
            </div>
            <Button asChild className="px-6">
              <Link href="/models">Go to model studio</Link>
            </Button>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {modelStudioHighlights.map((highlight) => (
              <Card key={highlight.title} className="border border-border/70 bg-card shadow-sm">
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
            <Card className="border border-border/70 bg-card shadow-sm">
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

            <Card className="border border-border/70 bg-card shadow-sm">
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

        <Card className="border border-border/70 bg-card shadow-sm">
          <CardContent className="flex flex-col gap-6 px-8 py-9 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3">
              <Badge variant="outline" className="w-fit text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Ready to brief us
              </Badge>
              <div className="space-y-2">
                <CardTitle className="text-2xl font-semibold">Bring us your most unforgiving workflow</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  In a 45 minute session we will surface the task graph, align on constraints, and deliver a scoping plan
                  for the dataset your model deserves.
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
