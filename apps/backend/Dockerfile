FROM node:18-alpine

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --prod

# Copy Prisma schema and generate client
COPY prisma ./prisma
RUN pnpm prisma generate

# Copy source code
COPY src ./src
COPY tsconfig.json ./

# Build the application
RUN pnpm build

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:4000/health || exit 1

# Start the application
CMD ["node", "dist/server.js"]
