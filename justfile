[private]
@default:
  just --list --unsorted

# Generate output files.
build: install
  tsc --noEmit
  bun ./index.js
  bun ./stats.js

# Formats files.
format:
  prettier --write "**/*.{js,md,json}"

[private]
install:
  pnpm install
