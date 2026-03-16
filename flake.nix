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
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = [
            rust
            pkgs.nodejs_20
            pkgs.postgresql_16
            pkgs.docker-compose
            pkgs.just
            pkgs.sqlx-cli
          ];

          shellHook = ''
            echo "Meela dev env is active"
            echo "Run 'meela dev' to start all services"
          '';
        };
      }
    );
}
