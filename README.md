## Prisma setup for ModelStation web

The Next.js frontend now reads its model portfolio data through Prisma.

1. `cd web`
2. Copy `.env.example` to `.env` and adjust `DATABASE_URL` if you prefer a different location than the default SQLite file.
3. Install the new dependencies: `npm install`
4. Generate the Prisma client: `npm run prisma:generate`
5. Push the schema to the local database: `npm run db:push`
6. Load the starter data used across the UI: `npm run db:seed`

After seeding you can run `npm run dev` and the pages will render from the database. If you add new tables or modify the schema, repeat the generate/push steps so the Prisma client stays in sync.
