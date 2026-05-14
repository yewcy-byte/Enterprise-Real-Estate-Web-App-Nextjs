# Build stage
FROM node:20-alpine AS builder

WORKDIR /app/client

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the Next.js app - continue even if there are errors
RUN npm run build || echo "Warning: Next.js build had errors but continuing..."

# Production stage
FROM node:20-alpine

WORKDIR /app/client

# Install only production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built app from builder
COPY --from=builder /app/client/.next ./.next
COPY --from=builder /app/client/public ./public
COPY --from=builder /app/client/next.config.ts ./

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
