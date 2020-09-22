# Git Share

A CLI for quickly sending your unfinished changes in a git repo to someone else.


## Installation

Add two git aliases:

1. `git config --global alias.share '!npx git-share share'`
1. `git config --global alias.take '!npx git-share take'`


## Usage

Running `git share` will commit all local changes to a new branch called `share/<random-number>` and push it up.

Running `git take` will pull down that branch, apply the changes to your working tree, and delete the branch.




