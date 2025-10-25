FROM node:20-bookworm-slim AS base

WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS deps

ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder

COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN NODE_ENV=production npm run build

FROM base AS runner

ENV NODE_ENV=production

RUN useradd --system --user-group --create-home nextjs
RUN chown nextjs:nextjs /app
USER nextjs

COPY --chown=nextjs:nextjs --from=builder /app/.next ./.next
COPY --chown=nextjs:nextjs --from=builder /app/public ./public
COPY --chown=nextjs:nextjs --from=builder /app/package.json ./package.json
COPY --chown=nextjs:nextjs --from=builder /app/package-lock.json ./package-lock.json
COPY --chown=nextjs:nextjs --from=builder /app/node_modules ./node_modules
COPY --chown=nextjs:nextjs --from=builder /app/next.config.ts ./next.config.ts
COPY --chown=nextjs:nextjs --from=builder /app/app ./app
COPY --chown=nextjs:nextjs --from=builder /app/components ./components
COPY --chown=nextjs:nextjs --from=builder /app/hooks ./hooks
COPY --chown=nextjs:nextjs --from=builder /app/lib ./lib
COPY --chown=nextjs:nextjs --from=builder /app/global.css ./global.css
COPY --chown=nextjs:nextjs --from=builder /app/postcss.config.js ./postcss.config.js
COPY --chown=nextjs:nextjs --from=builder /app/tailwind.config.ts ./tailwind.config.ts
COPY --chown=nextjs:nextjs --from=builder /app/tsconfig.json ./tsconfig.json
COPY --chown=nextjs:nextjs --from=builder /app/components.json ./components.json

EXPOSE 3000

CMD ["npm", "run", "start"]
