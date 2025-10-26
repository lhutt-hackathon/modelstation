## Prisma client setup

This service now owns database access via Prisma. The Docker image rebuild (triggered via Docker Compose) automatically runs `prisma generate`, so runtime containers always have an up-to-date client. When working locally outside of containers, regenerate the clients after every schema change so both the API and any seed scripts stay in sync:

```bash
npx prisma generate --schema services/api/prisma/schema.prisma
```

The command creates the Python client inside `services/api/prisma_client`. Make sure to re-run it whenever the schema changes.

Finally, refresh the Python environment so the new dependencies are locked in:

```bash
uv lock
uv sync
```
