# Build stage
FROM node:23-slim AS builder

WORKDIR /app

# Define build arguments for environment variables
ARG KEYCLOAK_CLIENT_ID
ARG KEYCLOAK_CLIENT_SECRET
ARG KEYCLOAK_URL
ARG KEYCLOAK_REALM
ARG NEXTAUTH_URL

# Set environment variables for build time
ENV KEYCLOAK_CLIENT_ID=${KEYCLOAK_CLIENT_ID}
ENV KEYCLOAK_CLIENT_SECRET=${KEYCLOAK_CLIENT_SECRET}
ENV KEYCLOAK_URL=${KEYCLOAK_URL}
ENV KEYCLOAK_REALM=${KEYCLOAK_REALM}
ENV NEXTAUTH_URL=${NEXTAUTH_URL}

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy all files
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:23-slim AS runner

WORKDIR /app

# Set environment variables for runtime
ENV NODE_ENV=production
ENV KEYCLOAK_CLIENT_ID=${KEYCLOAK_CLIENT_ID}
ENV KEYCLOAK_CLIENT_SECRET=${KEYCLOAK_CLIENT_SECRET}
ENV KEYCLOAK_URL=${KEYCLOAK_URL}
ENV KEYCLOAK_REALM=${KEYCLOAK_REALM}
ENV NEXTAUTH_URL=${NEXTAUTH_URL}

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]