[private]
@default:
  just --list --unsorted

# Generate output files.
build: install
  node ./index.js
  node ./stats.js

[private]
install:
  pnpm install
