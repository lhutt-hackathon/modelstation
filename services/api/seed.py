"""Seed the database with demo data."""
import asyncio
import json

import bcrypt
from prisma import Prisma


async def main() -> None:
    """Seed the database with demo data."""
    db = Prisma()
    await db.connect()

    try:
        print("Starting seed...")

        # Clean existing data (in correct order to respect foreign keys)
        await db.session.delete_many()
        await db.trainingmodel.delete_many()
        await db.highlightstat.delete_many()
        await db.roadmapitem.delete_many()
        await db.user.delete_many()

        print("Cleaned existing data")

        # Create demo user
        hashed_password = bcrypt.hashpw(b"modelstation", bcrypt.gensalt()).decode("utf-8")
        demo_user = await db.user.create(
            data={
                "email": "demo@modelstation.ai",
                "password": hashed_password,
                "name": "Demo Steward",
                "role": "admin",
            }
        )

        print(f"Created demo user: {demo_user.email}")

        # Create models for demo user
        model_data = [
            {
                "name": "Atlas QA Compliance Copilot",
                "domain": "Pharma QA & batch release",
                "baseModel": "GPT-4.1 Enterprise",
                "dataset": "Scoped run: CAPA narratives, protocol deltas, batch sign-off precedents",
                "status": "Live",
                "lastTrained": "3 days ago",
                "metrics": json.dumps(["98.2% rubric adherence", "37 sec MTTR delta"]),
                "highlights": json.dumps([
                    "Auto-summarises CAPA resolutions",
                    "Cross-checks protocol clauses in 11 jurisdictions",
                ]),
                "userId": demo_user.id,
            },
            {
                "name": "AeroWave Flight Line Specialist",
                "domain": "Aviation maintenance & AOG triage",
                "baseModel": "Claude 3 Sonnet",
                "dataset": "Scoped run: OEM bulletins, hangar chat transcripts, torque specs history",
                "status": "Pilot",
                "lastTrained": "8 days ago",
                "metrics": json.dumps(["92.7% tool-call accuracy", "38% faster torque sequencing"]),
                "highlights": json.dumps([
                    "Pushes real-time task cards to AMOS",
                    "Bilingual troubleshooting guidance",
                ]),
                "userId": demo_user.id,
            },
            {
                "name": "Sentinel Flow Surveillance Analyst",
                "domain": "Capital markets risk & compliance",
                "baseModel": "Mistral Large 2",
                "dataset": "Scoped run: Escalation workflows, policy rulings, flagged order flows",
                "status": "QA",
                "lastTrained": "Yesterday",
                "metrics": json.dumps(["99.1% policy precision", "5.4% false positive reduction"]),
                "highlights": json.dumps([
                    "Structured SAR narratives",
                    "Tier-1 escalation briefings with citations",
                ]),
                "userId": demo_user.id,
            },
        ]

        for data in model_data:
            await db.trainingmodel.create(data=data)

        print(f"Created {len(model_data)} models for demo user")

        # Create roadmap items
        roadmap_data = [
            {
                "title": "Underwriting synthesis pilot",
                "eta": "Week of Oct 21",
                "owner": "Insurance Ops",
                "detail": "Fine-tune on 1.7M annotated claims & policy deltas to recommend coverage decisions with auditable factors.",
            },
            {
                "title": "Multilingual compliance expansion",
                "eta": "Nov 4",
                "owner": "RegOps",
                "detail": "Extend Atlas QA Copilot with Spanish & Mandarin corpora plus region-specific policy guardrails.",
            },
            {
                "title": "Tool-grounded agentic workflows",
                "eta": "Mid-Nov",
                "owner": "Automation Guild",
                "detail": "Introduce chained tool-calls for reconciliation, evidence gathering, and auto-ticket closure in ServiceNow.",
            },
        ]

        for data in roadmap_data:
            await db.roadmapitem.create(data=data)

        print(f"Created {len(roadmap_data)} roadmap items")

        # Create highlight stats
        highlight_data = [
            {
                "title": "Models in production",
                "value": "14",
                "description": "Live copilots maintained across pharma, aviation, finance, and operations playbooks.",
                "iconKey": "RocketIcon",
            },
            {
                "title": "Median fine-tune window",
                "value": "11 days",
                "description": "From scoping brief to deployment-ready checkpoint with human sign-off.",
                "iconKey": "GaugeCircleIcon",
            },
            {
                "title": "Reusable components",
                "value": "63%",
                "description": "Shared tool schemas, eval suites, and prompts reused across the portfolio.",
                "iconKey": "LayersIcon",
            },
        ]

        for data in highlight_data:
            await db.highlightstat.create(data=data)

        print(f"Created {len(highlight_data)} highlight stats")

        print("Seed completed successfully!")
        print("\nDemo credentials:")
        print("  Email: demo@modelstation.ai")
        print("  Password: modelstation")

    finally:
        await db.disconnect()


if __name__ == "__main__":
    asyncio.run(main())
