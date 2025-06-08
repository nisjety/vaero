# Dockerfile - Fixed multi-stage build for backend service
FROM node:18-alpine AS base

# Install OpenSSL and other necessary dependencies for Prisma
RUN apk add --no-cache openssl libc6-compat

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Copy package files from backend directory
COPY apps/backend/package.json ./
COPY apps/backend/package-lock.json* ./

# Install dependencies - fixed command
RUN if [ -f package-lock.json ]; then \
      npm ci --omit=dev && npm cache clean --force; \
    else \
      npm install --production && npm cache clean --force; \
    fi

# Rebuild the source code only when needed
FROM base AS builder
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy necessary monorepo files
COPY apps/backend/package.json ./

# Create proper directory structure for tsconfig.base.json
RUN mkdir -p ../..
COPY tsconfig.base.json ../../tsconfig.base.json
COPY apps/backend/tsconfig.json ./

# Copy source code and prisma schema
COPY apps/backend/src ./src
COPY apps/backend/prisma ./prisma

# Install ALL dependencies for building (including dev dependencies)
RUN npm install

# Generate Prisma client - ensure schema is found
RUN npx prisma generate

# Build the application
RUN npm run build

# Production image, copy all the files and run the app
FROM base AS runner
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

# Copy built application and necessary files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

# Ensure Prisma client is available at runtime
RUN npx prisma generate

# Create AI models directory (will be mounted as volume)
RUN mkdir -p ./models

# Create logs directory
RUN mkdir -p logs && chown nodejs:nodejs logs

USER nodejs

EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

CMD ["node", "dist/server.js"]