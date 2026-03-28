[private]
@default:
  just --list --unsorted

# Generate output files.
build: install
  tsc --noEmit
  bun ./index.js
  bun ./stats.js

[private]
install:
  pnpm install
