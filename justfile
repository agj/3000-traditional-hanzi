[private]
@default:
  just --list --unsorted

# Generate output files.
build: install
  tsc --noEmit
  bun ./index.js
  bun ./stats.ts

# List all primitives that cannot be decomposed any further.
primitives: install
  bun ./list-primitives.js

# Formats files.
format:
  prettier --write "**/*.{js,md,json}"

[private]
install:
  pnpm install
