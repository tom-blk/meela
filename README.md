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

### Justfile
Run `just dev`, dependencies are:
- just
- postgres 16+
- rust / cargo
- node.js / npm
- sqlx-cli

The app will be available at http://localhost:5173

### Nix
Run `nix develop` then `meela dev` - no dependencies. (I know this is likely not going to be used, but I am on nixos and I'll include it for the sake of completeness)

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
