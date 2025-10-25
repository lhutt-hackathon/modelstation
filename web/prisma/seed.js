const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

const roadmapData = [
  {
    title: "Underwriting synthesis pilot",
    eta: "Week of Oct 21",
    owner: "Insurance Ops",
    detail:
      "Fine-tune on 1.7M annotated claims & policy deltas to recommend coverage decisions with auditable factors."
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
];

const highlightData = [
  {
    title: "Models in production",
    value: "14",
    description: "Live copilots maintained across pharma, aviation, finance, and operations playbooks.",
    iconKey: "RocketIcon"
  },
  {
    title: "Median fine-tune window",
    value: "11 days",
    description: "From scoping brief to deployment-ready checkpoint with human sign-off.",
    iconKey: "GaugeCircleIcon"
  },
  {
    title: "Reusable components",
    value: "63%",
    description: "Shared tool schemas, eval suites, and prompts reused across the portfolio.",
    iconKey: "LayersIcon"
  }
];

async function main() {
  console.log("Starting seed...");

  // Clean existing data (in correct order to respect foreign keys)
  await prisma.session.deleteMany();
  await prisma.model.deleteMany();
  await prisma.highlightStat.deleteMany();
  await prisma.roadmapItem.deleteMany();
  await prisma.user.deleteMany();

  console.log("Cleaned existing data");

  // Create demo user
  const hashedPassword = await bcrypt.hash("modelstation", 10);
  const demoUser = await prisma.user.create({
    data: {
      email: "demo@modelstation.ai",
      password: hashedPassword,
      name: "Demo Steward",
      role: "admin"
    }
  });

  console.log(`Created demo user: ${demoUser.email}`);

  // Create models for demo user
  const modelData = [
    {
      name: "Atlas QA Compliance Copilot",
      domain: "Pharma QA & batch release",
      baseModel: "GPT-4.1 Enterprise",
      dataset: "Scoped run: CAPA narratives, protocol deltas, batch sign-off precedents",
      status: "Live",
      lastTrained: "3 days ago",
      metrics: JSON.stringify(["98.2% rubric adherence", "37 sec MTTR delta"]),
      highlights: JSON.stringify(["Auto-summarises CAPA resolutions", "Cross-checks protocol clauses in 11 jurisdictions"]),
      userId: demoUser.id
    },
    {
      name: "AeroWave Flight Line Specialist",
      domain: "Aviation maintenance & AOG triage",
      baseModel: "Claude 3 Sonnet",
      dataset: "Scoped run: OEM bulletins, hangar chat transcripts, torque specs history",
      status: "Pilot",
      lastTrained: "8 days ago",
      metrics: JSON.stringify(["92.7% tool-call accuracy", "38% faster torque sequencing"]),
      highlights: JSON.stringify(["Pushes real-time task cards to AMOS", "Bilingual troubleshooting guidance"]),
      userId: demoUser.id
    },
    {
      name: "Sentinel Flow Surveillance Analyst",
      domain: "Capital markets risk & compliance",
      baseModel: "Mistral Large 2",
      dataset: "Scoped run: Escalation workflows, policy rulings, flagged order flows",
      status: "QA",
      lastTrained: "Yesterday",
      metrics: JSON.stringify(["99.1% policy precision", "5.4% false positive reduction"]),
      highlights: JSON.stringify(["Structured SAR narratives", "Tier-1 escalation briefings with citations"]),
      userId: demoUser.id
    }
  ];

  for (const data of modelData) {
    await prisma.model.create({ data });
  }

  console.log(`Created ${modelData.length} models for demo user`);

  // Create roadmap items
  for (const data of roadmapData) {
    await prisma.roadmapItem.create({ data });
  }

  console.log(`Created ${roadmapData.length} roadmap items`);

  // Create highlight stats
  for (const data of highlightData) {
    await prisma.highlightStat.create({ data });
  }

  console.log(`Created ${highlightData.length} highlight stats`);

  console.log("Seed completed successfully!");
  console.log("\nDemo credentials:");
  console.log("  Email: demo@modelstation.ai");
  console.log("  Password: modelstation");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
