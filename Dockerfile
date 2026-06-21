# Stage 1: Build
FROM node:24-alpine AS builder
WORKDIR /app
COPY package*.json tsconfig.json ./
RUN npm ci
COPY src/ ./src/
RUN npm run build

# Stage 2: Runtime
FROM node:24-alpine AS runtime

# Java JRE for ODFValidator
RUN apk add --no-cache openjdk11-jre

# Install veraPDF
RUN wget -q https://github.com/veraPDF/veraPDF-apps/releases/download/v1.26.2/verapdf-1.26.2.zip \
    && unzip -q verapdf-*.zip -d /opt/ \
    && rm verapdf-*.zip \
    && ln -s /opt/verapdf/verapdf /usr/local/bin/verapdf

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY tools/ ./tools/
COPY package.json ./

# Non-root user for security
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup
USER appuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s \
  CMD wget -q --spider http://localhost:3000/api/v1/health || exit 1

CMD ["node", "dist/index.js", "serve"]
