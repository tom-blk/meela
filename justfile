# Requirements: docker, node.js / npm

# Start backend (postgres + migrations + rust server)
backend:
    docker compose up --build -d

# Stop backend
backend-stop:
    docker compose down

# View backend logs
logs:
    docker compose logs -f

# Install frontend deps
frontend-install:
    cd frontend && npm install

# Start frontend
frontend:
    cd frontend && npm run dev

# Start entire dev env
dev:
    #!/usr/bin/env bash
    just backend
    just frontend-install
    echo "Waiting for backend to be ready..."
    for i in {1..30}; do
        curl -s http://localhost:3005/api/questions > /dev/null && break
        sleep 1
    done
    echo "Backend ready. Starting frontend..."
    trap "just backend-stop" EXIT
    just frontend
