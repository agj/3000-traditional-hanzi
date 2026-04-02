[private]
@default:
  just --list --unsorted

# Generate output files.
build: install
  tsc --noEmit
  node ./src/generate-notes.ts
  node ./src/generate-stats.ts

# Displays all primitives that cannot be decomposed any further.
primitives: install
  node ./src/print-primitives.ts

# Formats files.
format:
  prettier --write "**/*.{ts,js,md,json}"

[private]
install:
  pnpm install
