[private]
@default:
  just --list --unsorted

# Generate output files.
build: install
  bun ./index.js
  bun ./stats.js

[private]
install:
  pnpm install
