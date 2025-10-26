"""Test database has data."""
import asyncio

from prisma import Prisma


async def test() -> None:
    """Test database."""
    db = Prisma()
    await db.connect()
    models = await db.trainingmodel.find_many()
    print(f"Found {len(models)} models")
    for model in models:
        print(f"  - {model.name}")
    await db.disconnect()


asyncio.run(test())
