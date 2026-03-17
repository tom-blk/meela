FROM rust:1.85-bookworm AS builder

WORKDIR /app

# Install sqlx-cli for migrations
RUN cargo install sqlx-cli --no-default-features --features postgres --locked

COPY Cargo.toml Cargo.lock ./
COPY src ./src

RUN cargo build --release

FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y libssl3 ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=builder /app/target/release/backend .
COPY --from=builder /usr/local/cargo/bin/sqlx /usr/local/bin/sqlx
COPY migrations ./migrations
COPY .env .env

ENV DATABASE_URL="postgres://postgres:postgres@postgres:5432/meela"

EXPOSE 3005
CMD sqlx migrate run && ./backend
