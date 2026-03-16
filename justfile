# Start postgres
db:
    docker compose up -d postgres

# Stop postgres
db-stop:
    docker compose down

# Run database migrations
migrate:
    cd backend && sqlx migrate run

# Start backend
backend:
    cd backend && cargo run

# Start frontend dev server
frontend:
    cd frontend && npm run dev

# Start all services (postgres + backend + frontend)
dev: db
    @echo "Waiting for postgres..."
    @sleep 2
    just backend &
    just frontend
