FROM rust:1.83-bookworm AS builder

WORKDIR /app
COPY Cargo.toml Cargo.lock ./
COPY src ./src

RUN cargo build --release

FROM debian:bookworm-slim

WORKDIR /app
COPY --from=builder /app/target/release/backend .
COPY migrations ./migrations

ENV DATABASE_URL="postgres://postgres:postgres@postgres:5432/meela"

EXPOSE 3005
CMD ["./backend"]
