# Build stage
FROM node:23-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy all files
COPY . .
# COPY .env.production .env

# Build the application
RUN npm run build

# Production stage
FROM node:23-slim AS runner

WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
# ENV KEYCLOAK_ISSUER=${KEYCLOAK_ISSUER}

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Create script to generate runtime environment
# RUN echo "window.__ENV__ = { \
#     KEYCLOAK_ISSUER: '$KEYCLOAK_ISSUER', \
#     KEYCLOAK_CLIENT_ID: '$KEYCLOAK_CLIENT_ID', \
#     KEYCLOAK_CLIENT_SECRET: '$KEYCLOAK_CLIENT_SECRET' \
# };" > ./public/runtime-env.js

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]