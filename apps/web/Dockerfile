# Build stage
FROM node:20-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY .npmrc ./

# Copy all package.json files for workspace resolution
COPY apps/web/package.json ./apps/web/
COPY apps/backend/package.json ./apps/backend/

# Copy packages if they exist
COPY packages ./packages

# Install dependencies at the workspace root
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/web ./apps/web
COPY tsconfig.base.json ./

# Build from workspace root using pnpm filter
RUN pnpm --filter web build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Copy built application - use the correct path structure that Next.js creates
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Use the correct path to the server.js file
CMD ["node", "apps/web/server.js"]
