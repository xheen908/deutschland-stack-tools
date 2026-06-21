# Deployment Guide

## Docker (Recommended)

The easiest way to deploy the `deutschland-stack-tools` is using Docker.

```bash
docker run -d -p 3000:3000 --restart always ghcr.io/xheen908/deutschland-stack-tools:latest
```

## Docker Compose

For more advanced configurations, use the provided `docker-compose.yml`:

```bash
docker compose up -d
```

### Environment Variables
- `PORT`: The port to run the API on (default: 3000)
- `MAX_FILE_SIZE`: Maximum upload size in bytes (default: 52428800 for 50MB)
- `RATE_LIMIT_MAX`: Maximum requests per minute (default: 100)
- `LOG_LEVEL`: Logging level (e.g., info, debug, error)
