# Frontend Dockerfile
# This creates a production-ready Docker image for the Nuxt.js application

# Stage 1: Build the application
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies needed for build)
RUN npm ci --silent

# Copy source code
COPY . .

# Build the Nuxt application for production
# This creates optimized static files and server bundle
RUN npm run build

# Stage 2: Production image
# Multi-stage build keeps the final image small by excluding build dependencies
FROM node:20-alpine

WORKDIR /app

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm ci --production --silent

# Copy the built application from the builder stage
# .output contains the production build from Nuxt
COPY --from=builder /app/.output ./.output

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership to nodejs user
RUN chown -R nodejs:nodejs /app

# Switch to nodejs user
USER nodejs

# Expose port 3000
EXPOSE 3000

# Environment variable for production
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }).on('error', () => process.exit(1));"

# Start the Nuxt server
# Nuxt 3 production server runs from the .output directory
CMD ["node", ".output/server/index.mjs"]
