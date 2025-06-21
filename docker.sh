#!/bin/bash

# Docker helper script for KnowHowPages Editor

case "$1" in
  "dev")
    echo "Starting development environment..."
    docker compose up --build
    ;;
  "dev-detached")
    echo "Starting development environment in background..."
    docker compose up --build -d
    ;;
  "prod")
    echo "Starting production environment..."
    docker compose -f docker-compose.prod.yml up --build -d
    ;;
  "stop")
    echo "Stopping all containers..."
    docker compose down
    docker compose -f docker-compose.prod.yml down
    ;;
  "clean")
    echo "Cleaning up Docker resources..."
    docker compose down --volumes --remove-orphans
    docker system prune -f
    ;;
  "logs")
    if [ -z "$2" ]; then
      docker compose logs -f
    else
      docker compose logs -f "$2"
    fi
    ;;
  "rebuild")
    echo "Rebuilding all containers..."
    docker compose down
    docker compose build --no-cache
    docker compose up
    ;;
  *)
    echo "Usage: $0 {dev|dev-detached|prod|stop|clean|logs [service]|rebuild}"
    echo ""
    echo "Commands:"
    echo "  dev           - Start development environment with hot reload"
    echo "  dev-detached  - Start development environment in background"
    echo "  prod          - Start production environment"
    echo "  stop          - Stop all running containers"
    echo "  clean         - Clean up Docker resources"
    echo "  logs [service]- View logs (optionally for specific service)"
    echo "  rebuild       - Rebuild containers from scratch"
    exit 1
    ;;
esac
