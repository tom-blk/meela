# Requirements: postgres, cargo, npm, sqlx-cli

set dotenv-load

pgdata := ".pgdata"

# Start postgres
db:
    #!/usr/bin/env bash
    export PGDATA="{{pgdata}}"
    if [ ! -d "$PGDATA" ]; then
        echo "Initializing postgres data directory..."
        initdb -D "$PGDATA" --no-locale --encoding=UTF8
    fi
    if ! pg_ctl -D "$PGDATA" status > /dev/null 2>&1; then
        echo "Starting postgres..."
        pg_ctl -D "$PGDATA" -l "$PGDATA/logfile" -o "-k /tmp" start
    else
        echo "Postgres already running"
    fi

    echo "Waiting for postgres to be ready..."
    for i in 1 2 3 4 5 6 7 8 9 10; do
        psql -h /tmp -d postgres -c "SELECT 1" > /dev/null 2>&1 && break
        sleep 1
    done
    if ! psql -h /tmp -d postgres -tc "SELECT 1 FROM pg_database WHERE datname = 'meela'" | grep -q 1; then
        echo "Creating meela database..."
        createdb -h /tmp meela
    fi

# Stop postgres
db-stop:
    pg_ctl -D {{pgdata}} stop 2>/dev/null || true

# Run db migrations
migrate:
    cd backend && sqlx migrate run

# Start backend
backend:
    cd backend && cargo run

# Start frontend
frontend:
    cd frontend && npm run dev

# Install frontend deps
frontend-install:
    cd frontend && npm install

# Start entire dev env
dev:
    #!/usr/bin/env bash
    just db
    just migrate
    just frontend-install
    just backend &
    BACKEND_PID=$!
    just frontend &
    FRONTEND_PID=$!
    trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; just db-stop" EXIT
    wait
