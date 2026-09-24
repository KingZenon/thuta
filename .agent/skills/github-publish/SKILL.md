---
name: github-publish
description: Publish this workspace's root and app, api, and mobile sibling projects as separate public GitHub repositories, linking the siblings as root submodules. Use when asked to publish or synchronize the whole Settla workspace.
---

# Publish the Settla workspace

The expected public repositories are `thuta` (workspace root), `thuta-app`, `thuta-api`, and `thuta-mobile`. Determine the GitHub owner from the authenticated account or existing remote; do not assume the account has not changed. The root tracks the three sibling repositories as submodules at `app`, `api`, and `mobile`.

## Prepare

1. Read the root and relevant sibling `AGENTS.md` files. Inspect Git status, remotes, branches, ignore rules, and existing GitHub repositories before mutation.
2. Preserve uncommitted work. Check for secrets, database files, generated output, and large local dependencies before adding files.
3. Distinguish an existing publication from a new one. Do not replace repository history, change an existing remote, force push, delete repositories, or change public visibility without an explicit request covering that action.

## Publish

- Prefer the connected GitHub plugin for supported repository operations. Use GitHub CLI for operations the plugin cannot perform; verify CLI authentication before creating repositories. If neither is usable, complete safe local preparation and report the blocker.
- Create any missing sibling Git repositories locally. Commit the intended tracked content in each sibling and publish each to its corresponding **public** GitHub repository. Reuse an existing repository only after verifying its owner, visibility, and history.
- In the root repository, replace ordinary tracked sibling directories with submodule entries pointing to the published sibling URLs. Commit `.gitmodules`, the submodule gitlinks, and root-only files. Preserve the root's existing Git history unless the user explicitly requests a new history.
- Publish the root to the public `thuta` repository. Keep unrelated existing remotes intact; add a distinct remote if needed.
- Verify every repository is public, each sibling remote and pushed commit match, and a fresh root clone with recursive submodules can resolve all three URLs.

Stop before a conflicting remote, name collision, missing authentication, or destructive conversion that cannot be resolved from the user's request. Report the exact state and next required action. A prior request to publish does not authorize future unrelated pushes.
