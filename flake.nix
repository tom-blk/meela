{
  description = "Meela technical assignment dev env";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    rust-overlay.url = "github:oxalica/rust-overlay";
  };

  outputs = { self, nixpkgs, flake-utils, rust-overlay }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        overlays = [ (import rust-overlay) ];
        pkgs = import nixpkgs {
          inherit system overlays;
        };
        rust = pkgs.rust-bin.stable.latest.default.override {
          extensions = [ "rust-src" "rust-analyzer" ];
        };
        pgData = "./.pgdata";
        meela = pkgs.writeShellScriptBin "meela" ''
          export PGDATA="${pgData}"
          export DATABASE_URL="postgres:///meela?host=/tmp"

          case "$1" in
            dev)
              meela db
              meela migrate
              (cd frontend && ${pkgs.nodejs_20}/bin/npm install)
              (cd backend && ${rust}/bin/cargo run) &
              BACKEND_PID=$!
              (cd frontend && ${pkgs.nodejs_20}/bin/npm run dev) &
              FRONTEND_PID=$!
              trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; meela db-stop" EXIT
              wait
              ;;
            db)
              if [ ! -d "$PGDATA" ]; then
                echo "Starting postgres..."
                ${pkgs.postgresql_16}/bin/initdb -D "$PGDATA" --no-locale --encoding=UTF8
              fi
              if ! ${pkgs.postgresql_16}/bin/pg_ctl -D "$PGDATA" status > /dev/null 2>&1; then
                ${pkgs.postgresql_16}/bin/pg_ctl -D "$PGDATA" -l "$PGDATA/logfile" -o "-k /tmp" start
              else
                echo "Postgres already running"
              fi
              # Wait for postgres and create database
              echo "Waiting for postgres to be ready..."
              for i in 1 2 3 4 5 6 7 8 9 10; do
                if ${pkgs.postgresql_16}/bin/psql -h /tmp -d postgres -c "SELECT 1" > /dev/null 2>&1; then
                  break
                fi
                sleep 1
              done
              # Create database if it doesn't exist
              if ! ${pkgs.postgresql_16}/bin/psql -h /tmp -d postgres -tc "SELECT 1 FROM pg_database WHERE datname = 'meela'" | grep -q 1; then
                echo "Creating meela database..."
                ${pkgs.postgresql_16}/bin/createdb -h /tmp meela
              fi
              ;;
            db-stop)
              echo "Stopping postgres..."
              ${pkgs.postgresql_16}/bin/pg_ctl -D "$PGDATA" stop 2>/dev/null || true
              ;;
            migrate)
              cd backend && ${pkgs.sqlx-cli}/bin/sqlx migrate run
              ;;
            backend)
              cd backend && ${rust}/bin/cargo run
              ;;
            frontend)
              cd frontend && ${pkgs.nodejs_20}/bin/npm run dev
              ;;
            *)
              echo "Usage: meela <command>"
              echo ""
              echo "Commands:"
              echo "  dev       Start all services (postgres + backend + frontend)"
              echo "  db        Start postgres"
              echo "  db-stop   Stop postgres"
              echo "  migrate   Run database migrations"
              echo "  backend   Start backend"
              echo "  frontend  Start frontend dev server"
              ;;
          esac
        '';
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = [
            rust
            pkgs.nodejs_20
            pkgs.postgresql_16
            pkgs.just
            pkgs.sqlx-cli
            meela
          ];

          shellHook = ''
            export DATABASE_URL="postgres:///meela?host=/tmp"
            echo "Meela dev env is active"
            echo "Run 'meela dev' to start all services"
            echo "Run 'meela' for available commands"
          '';
        };
      }
    );
}
