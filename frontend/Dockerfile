# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Accept build argument for public backend URL
ARG NEXT_PUBLIC_BACKEND_URL
ENV NEXT_PUBLIC_BACKEND_URL=${NEXT_PUBLIC_BACKEND_URL}

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build
COPY . .
# Next.js picks NEXT_PUBLIC_* client vars at build time
RUN npm run build

# Run stage (using Next.js standalone output)
FROM node:20-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app

# Copy the minimal standalone build
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
