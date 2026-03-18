# Summary

## Stack
- Solid.js (Typescript, Tailwind)
- Rust (Poem)
- Postgres

## Features
- Multi-step form with automatic save to database on every answer
- Light / dark theme
- Ability to navigate freely between questions and return to the latest in the list
- The form can be resumed after refreshing the page or closing the browser

## Usage

### Justfile (recommended)
Run `just dev` in the project repository, dependencies are:
- just
- docker + docker compose, the current user should be added to the docker group (`sudo usermod -aG docker $USER` on linux)
- node.js 20+ / npm

The app will be available at http://localhost:5173

### Nix (alternative to just, only recommended if dependencies for just aren't met and should not be installed)
Run `nix develop` in the project repository, then `meela dev` - no additional dependencies, works on any system with nix installed and flakes enabled.

The app will be available at http://localhost:5173

## Screenshots
The screenshots can be found in screenshots/

## Additional Notes
The style is chosen to follow UI/UX best practices, but also kept simple to be highly adaptable.

I assumed that the rule excluding localStorage as an option to store the state covers cookies and indexedDb as well.

Since I have a background in both rust and frontend development I put equal focus on the frontend and the backend.

To make this production-ready, I'd probably make a few additional adjustments:
- at the moment, users can skip questions, depending how the data gets processed later, this should be prevented
- use tanstack-router on the frontend
- use tanstack-query on the frontend
- use axum on the backend (what I am used to, but I have never used poem before and was curious)
- add a toasting library for errors
- slim down dependencies
- graceful shutdown
- add a more robust error handling system

Additional Note: When opening the frontend a new uuid URL parameter will be generated, if switching or clearing the database and refreshing, an error will be thrown because the database doesn't recognize the uuid left over in the URL parameter.

Tested on NixOS, Arch Linux and Ubuntu
