# Docker Setup (Isolated Development)

## Why Docker?

Running code in Docker gives you:
- ✅ Complete isolation from your system
- ✅ Easy cleanup (just delete container)
- ✅ Same environment everywhere
- ✅ No risk to your main system

## Quick Start

```bash
# Start everything
docker-compose up

# Or in background
docker-compose up -d

# Stop
docker-compose down

# Clean everything
docker-compose down -v
docker system prune
```

## Manual Docker Commands

```bash
# Build image
docker build -t fhe-chat .

# Run container
docker run -p 3000:3000 \
  -v $(pwd):/app \
  -v /app/node_modules \
  -v /app/.next \
  fhe-chat

# Run with environment file
docker run -p 3000:3000 \
  --env-file .env.local \
  -v $(pwd):/app \
  fhe-chat
```

## Access Container

```bash
# Get container ID
docker ps

# Enter container
docker exec -it <container-id> sh

# Run commands inside
docker exec -it <container-id> npm run build
```

## Troubleshooting

**Port already in use:**
```bash
# Change port in docker-compose.yml
ports:
  - "3001:3000"  # use 3001 instead
```

**Permission issues:**
```bash
# Fix node_modules permissions
docker-compose exec app chown -R node:node /app
```

**Rebuild after changes:**
```bash
docker-compose up --build
```

