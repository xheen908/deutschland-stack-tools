FROM verapdf/cli:latest AS verapdf

# Stage 1: Build
FROM node:24-alpine AS builder
WORKDIR /app
COPY package*.json tsconfig.json ./
RUN npm ci
COPY src/ ./src/
RUN npm run build

# Stage 2: Runtime
FROM node:24-alpine AS runtime

# Java JRE for ODFValidator and veraPDF
RUN apk add --no-cache openjdk11-jre wget unzip

WORKDIR /app

# Copy application files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./
COPY tools/ ./tools/

# Download ODF Validator into tools folder (if not copied)
RUN wget -q -O /tmp/odftoolkit.zip https://github.com/tdf/odftoolkit/releases/download/v0.13.0/odftoolkit-0.13.0-bin.zip \
    && unzip -q /tmp/odftoolkit.zip odfvalidator-0.13.0-jar-with-dependencies.jar -d tools/ \
    && mv tools/odfvalidator-0.13.0-jar-with-dependencies.jar tools/odfvalidator.jar \
    && rm /tmp/odftoolkit.zip

# Copy veraPDF from official image
COPY --from=verapdf /opt/verapdf /opt/verapdf
RUN ln -s /opt/verapdf/verapdf /usr/local/bin/verapdf

# Non-root user for security
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup
USER appuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s \
  CMD wget -q --spider http://localhost:3000/api/v1/health || exit 1

CMD ["node", "dist/index.js", "serve"]
