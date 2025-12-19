# Stage 1: Base image with Node.js
FROM node:18-alpine AS base

# Install OpenSSL for Prisma (required in Alpine Linux)
RUN apk add --no-cache openssl

# Set working directory inside container
WORKDIR /app

# Copy package files
COPY package*.json ./

# Stage 2: Dependencies
FROM base AS dependencies

# Install all dependencies (including dev dependencies for Prisma)
RUN npm ci

# Generate Prisma Client
COPY prisma ./prisma
RUN npx prisma generate

# Stage 3: Production
FROM base AS production

# Set production environment
ENV NODE_ENV=production

# Copy only production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy Prisma client from dependencies stage
COPY --from=dependencies /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=dependencies /app/node_modules/@prisma ./node_modules/@prisma

# Copy application source code
COPY src ./src
COPY prisma ./prisma

# Create logs directory
RUN mkdir -p logs

# Expose port (the port your app listens on)
EXPOSE 3000

# Health check to verify container is running properly
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Run the application
CMD ["node", "src/server.js"]
