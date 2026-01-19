# Backend Dockerfile for ESQCMS
FROM node:20-alpine AS base

# Install dependencies for bcrypt native module and OpenSSL for Prisma
RUN apk add --no-cache python3 make g++ libc6-compat openssl openssl-dev

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
FROM base AS deps
RUN npm ci --only=production && npm cache clean --force
# Generate Prisma Client
RUN npx prisma generate

# Development stage
FROM base AS development
RUN npm ci
RUN npx prisma generate
COPY . .
CMD ["npm", "run", "dev"]

# Production stage
FROM base AS production
ENV NODE_ENV=production

# Copy production dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/node_modules/.prisma ./node_modules/.prisma

# Copy application code
COPY . .

# Create uploads directory
RUN mkdir -p uploads/delivery-orders uploads/drawings uploads/profile-pictures

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 expressjs
RUN chown -R expressjs:nodejs /app
USER expressjs

EXPOSE 4100

# Start the application - use db push to ensure schema is applied, then migrate, then seed
CMD ["sh", "-c", "npx prisma db push --skip-generate && npx prisma migrate deploy && if [ \"$RUN_SEEDER\" = \"true\" ]; then node prisma/seed.js; fi && npm start"]
