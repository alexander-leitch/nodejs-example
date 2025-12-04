# API Dockerfile
# This creates a production-ready Docker image for the Node.js API

# Use Node.js 20 LTS (Long Term Support) as the base image
# Alpine variant is much smaller (~40MB vs ~900MB) while still fully functional
FROM node:20-alpine

# Set working directory inside the container
# All subsequent commands will run from this directory
WORKDIR /app

# Copy package files first
# This is done separately to take advantage of Docker's layer caching
# If package.json hasn't changed, Docker will use cached node_modules
COPY package*.json ./

# Install dependencies
# --production flag skips devDependencies (like nodemon)
# --silent reduces npm output noise
RUN npm ci --production --silent

# Copy application source code
# This happens after npm install so code changes don't bust the cache
COPY src/ ./src/

# Create a non-root user for security
# Running as root in containers is a security risk
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership of app files to the nodejs user
RUN chown -R nodejs:nodejs /app

# Switch to the nodejs user
# All subsequent commands and the container will run as this user
USER nodejs

# Expose the port the app runs on
# This is documentation - doesn't actually publish the port
EXPOSE 3001

# Health check to verify the container is working
# Docker will periodically hit this endpoint
# If it fails multiple times, the container is marked unhealthy
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }).on('error', () => process.exit(1));"

# Command to run when container starts
# Using array syntax is preferred over string syntax
CMD ["node", "src/index.js"]
