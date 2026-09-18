# ---- Dependencies ----
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- Build ----
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# No NEXT_PUBLIC_API_URL build arg on purpose: the client always calls relative "/api/..."
# paths, which src/app/api/[...path]/route.ts proxies server-side to the real API. Baking an
# absolute URL in here would make the browser call the API directly again, which its CORS
# allowlist (production domains only) rejects for anything else, including this container.
#
# The Telegram bot's @username, unlike API_PROXY_TARGET below, has to be a build arg: the
# Login Widget script tag is rendered client-side, and NEXT_PUBLIC_* values are only ever
# inlined into the bundle at build time, never read from the container's runtime environment.
# Defaulted here (not just in docker-compose.local.yml) so a plain `docker build`, or a
# compose run whose ".env" discovery misses for any reason, still gets a working image
# instead of silently building one with the Telegram login button missing.
ARG NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=FiveNinetyStCafeBot
ENV NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=$NEXT_PUBLIC_TELEGRAM_BOT_USERNAME
RUN npm run build

# ---- Run ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup -S nextjs && adduser -S nextjs -G nextjs

# Requires next.config.js to have: output: 'standalone'
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nextjs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nextjs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
# Server-side only (never NEXT_PUBLIC_*, so it's never in the client bundle) — where
# src/app/api/[...path]/route.ts forwards proxied requests. Override at `docker run`/compose
# time to point a container at a different API without rebuilding the image.
ENV API_PROXY_TARGET=https://api.590stcafe.shop

CMD ["node", "server.js"]