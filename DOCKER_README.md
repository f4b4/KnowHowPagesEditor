# KnowHowPagesEditor - Docker Configuration

A complete Docker setup for the KnowHowPagesEditor project with separate client and server containers, optimized for Windows 11 development.

## Architecture

- **Client Container**: React + Vite development server running on port 3000
- **Server Container**: Fastify API server running on port 3001
- **Sub-path Configuration**: 
  - Client runs under `/KnowHowPagesEditor/`
  - API runs under `/KnowHowPagesEditorApi/`

## Quick Start

### Windows (Recommended)
```bash
# Start development environment
docker.bat dev

# Start in background
docker.bat dev-detached

# Start production environment
docker.bat prod

# Stop all containers
docker.bat stop

# Clean up Docker resources
docker.bat clean
```

### Cross-platform
```bash
# Development
docker compose up

# Production
docker compose -f docker-compose.prod.yml up -d

# Stop
docker compose down
```

## Development Environment

When running in development mode:

- **Client**: Available at http://localhost:3000/KnowHowPagesEditor/
- **API**: Available at http://localhost:3001/KnowHowPagesEditorApi/
- **Hot Reload**: Both client and server support hot reloading
- **Volume Mounting**: Source code is mounted for live development

### Development Features

- TypeScript compilation with hot reload
- Automatic server restart on file changes
- CORS enabled for local development
- Source maps enabled for debugging

## Production Environment

Production builds include:

- Optimized React build with static asset serving
- Minified TypeScript server
- Multi-stage Docker builds for smaller images
- Production-ready configuration

## Environment Variables

### Client (Vite)
- `VITE_API_URL`: API base URL (default: http://localhost:3001/KnowHowPagesEditorApi)

### Server (Fastify)
- `NODE_ENV`: Environment mode (development/production)
- `PORT`: Server port (default: 3001)
- `API_BASE_PATH`: API base path (default: /KnowHowPagesEditorApi)

## File Structure

```
├── docker-compose.yml          # Development configuration
├── docker-compose.prod.yml     # Production configuration
├── Dockerfile.client          # React/Vite container
├── Dockerfile.server          # Fastify container
├── docker.bat                 # Windows helper script
├── .dockerignore              # Docker ignore file
└── vite.config.ts             # Vite configuration with proxy
```

## Troubleshooting

### Windows-specific Issues

1. **Path mounting issues**: Ensure Docker Desktop is configured to share the drive where your project is located.

2. **Permission issues**: Run Docker commands as Administrator if needed.

3. **File watching**: If hot reload isn't working, try using the polling option in your development tools.

### Container Issues

1. **Port conflicts**: Ensure ports 3000 and 3001 are not in use by other applications.

2. **Build failures**: Clean Docker cache with `docker.bat clean` and rebuild.

3. **Network issues**: Restart Docker Desktop if containers can't communicate.

### Logs and Debugging

```bash
# View all logs
docker.bat logs

# View specific service logs
docker compose logs client
docker compose logs server

# Follow logs in real-time
docker compose logs -f
```

## Development Workflow

1. **Start development environment**:
   ```bash
   docker.bat dev
   ```

2. **Make code changes**: Files are automatically synced to containers

3. **View changes**: Browser automatically refreshes for client changes

4. **API changes**: Server automatically restarts

5. **Stop development**:
   ```bash
   docker.bat stop
   ```

## Production Deployment

For production deployment on a Linux server:

1. **Build production images**:
   ```bash
   docker compose -f docker-compose.prod.yml build
   ```

2. **Deploy**:
   ```bash
   docker compose -f docker-compose.prod.yml up -d
   ```

3. **Configure reverse proxy** (nginx/Apache) to:
   - Serve client from `/KnowHowPagesEditor/` → `http://localhost:3000`
   - Proxy API from `/KnowHowPagesEditorApi/` → `http://localhost:3001/KnowHowPagesEditorApi/`

## Docker Commands Reference

```bash
# Development
docker.bat dev              # Start dev environment
docker.bat dev-detached     # Start dev in background
docker.bat stop             # Stop all containers
docker.bat clean            # Clean up resources
docker.bat logs             # View logs
docker.bat rebuild          # Rebuild from scratch

# Manual commands
docker compose up           # Start development
docker compose down         # Stop development
docker compose build       # Build images
docker compose ps           # List containers
```
