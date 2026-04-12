# ===========================================
# Dockerfile cho Backend - Koyeb Deployment
# ===========================================

# Base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Expose port (Koyeb sẽ gán PORT env variable)
EXPOSE 10000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-10000}/api/health || exit 1

# Run the application
CMD ["node", "src/index.js"]
