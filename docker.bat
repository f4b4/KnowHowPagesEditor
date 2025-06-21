@echo off
REM Docker helper script for KnowHowPages Editor (Windows)

if "%1"=="dev" (
    echo Starting development environment...
    echo Client will be available at: http://localhost:3000/
    echo API will be available at: http://localhost:3001/
    docker compose up --build
) else if "%1"=="dev-detached" (
    echo Starting development environment in background...
    echo Client will be available at: http://localhost:3000/
    echo API will be available at: http://localhost:3001/
    docker compose up --build -d
) else if "%1"=="prod" (
    echo Starting production environment...
    echo Client will be available at: http://localhost:3000/
    echo API will be available at: http://localhost:3001/
    docker compose -f docker-compose.prod.yml up --build -d
) else if "%1"=="stop" (
    echo Stopping all containers...
    docker compose down
    docker compose -f docker-compose.prod.yml down
) else if "%1"=="clean" (
    echo Cleaning up Docker resources...
    docker compose down --volumes --remove-orphans
    docker system prune -f
) else if "%1"=="logs" (
    if "%2"=="" (
        docker compose logs -f
    ) else (
        docker compose logs -f %2
    )
) else if "%1"=="rebuild" (
    echo Rebuilding all containers...
    docker compose down
    docker compose build --no-cache
    docker compose up
) else (
    echo Usage: %0 {dev^|dev-detached^|prod^|stop^|clean^|logs [service]^|rebuild}
    echo.
    echo Commands:
    echo   dev           - Start development environment with hot reload
    echo   dev-detached  - Start development environment in background
    echo   prod          - Start production environment
    echo   stop          - Stop all running containers
    echo   clean         - Clean up Docker resources
    echo   logs [service]- View logs ^(optionally for specific service^)
    echo   rebuild       - Rebuild containers from scratch
)
