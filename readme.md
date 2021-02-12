# Git Share 🤝

A CLI for quickly sending your unfinished changes to someone else via git.


## Installation

No installation required! Just run the package with `npx git-share`.

You can also install the package using `npm i -g git-share` to skip installation on each run.

## Usage

If you allow installation of the git aliases you can use `git share` and `git take`.

Without the aliases you can use `npx git-share` and `npx git-share take`.

Running `git share` will commit all local changes to a new branch called `share/<random-number>` and push it up.

Running `git take` will pull down that branch, apply the changes to your working tree, and delete the branch.


## Publishing

1. Run `npm run release`
