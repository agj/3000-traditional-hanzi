# Development setup

I don't really expect contributors to this project, but this seems like a good
place to explain how to run the code here that generates the resulting files
from the data, in case people want to do something with it.

Warning: You'll need a basic understanding of terminal emulators in order to
follow along.

This project uses [Nix](https://nixos.org/) to set up an ephemeral development
environment which contains a few necessary tools, such as Node. To install Nix,
I recommend the [experimental installer](https://github.com/NixOS/nix-installer).
If you have it installed, make sure you [have the “flakes” feature
active](https://wiki.nixos.org/wiki/Flakes#Setup).

If you use [direnv](https://direnv.net/), when you enter this project's
directory run `direnv allow` in order to start the development shell. Otherwise,
run `nix develop` to enter a Bash shell with the environment set up, or `nix
develop -c $SHELL` to do it under your own shell (zsh, Nushell or whatever you
have configured).

Run `just` to see a list of project tasks you may run. `just build` will
generate the output files.

Most of the code has comments that describe what it does, hopefully it'll be
enough to get you started.

## Relevant files

- `src/` – Where all of the source code lives. Peep `justfile` in
  order to understand what is actually being run.
- `data/` – Data consumed by the code.
  - `conflate.txt` – Character variants that must be conflated into a base
    character.
  - `exclude.txt` – Characters not to include in the output.
  - `patches.txt` – Fields to patch (replace) in the output data.
  - `external/` – Data from external sources.
- `justfile` – Definition of project tasks, those you run with the `just`
  command.
