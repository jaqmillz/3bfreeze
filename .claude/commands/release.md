# /release — Version, changelog, tag, and deploy

You are performing a release for the 3Bfreeze project. Follow these steps exactly:

## 1. Determine what changed

- Run `git log --oneline $(git describe --tags --abbrev=0)..HEAD` to see all commits since the last tag.
- Read the diff with `git diff $(git describe --tags --abbrev=0)..HEAD --stat` to understand scope.
- Check `supabase/migrations/` for any new migration files since last release.

## 2. Determine version bump

Ask the user which version bump to apply:
- **patch** (bug fixes, small tweaks)
- **minor** (new features, new migrations)
- **major** (breaking changes)

Show the current version from `package.json` and what the new version would be for each option.

## 3. Update package.json version

Edit `package.json` to set the new version number.

## 4. Write the CHANGELOG entry

Add a new `## [vX.Y.Z] — YYYY-MM-DD` entry at the top of `CHANGELOG.md` (below the `# Changelog` heading).

Follow the existing changelog style:
- For patch releases: simple bullet list of changes
- For minor/major releases: use `### Features`, `### Infrastructure`, `### Security & Bug Fixes`, `### Code Quality` subsections as needed
- Reference migration numbers if any new migrations were added (e.g., "**Migration 007**: description")
- Reference environment variables if any were added or changed
- Be concise but specific — describe what changed and why

Show the draft entry to the user for approval before writing it.

## 5. Commit the release

Stage and commit only `package.json` and `CHANGELOG.md` with message:
```
Release vX.Y.Z
```

## 6. Tag the release

Create an annotated tag:
```
git tag -a vX.Y.Z -m "vX.Y.Z"
```

## 7. Push

Push the commit and tag:
```
git push && git push --tags
```

This triggers a Vercel auto-deploy.

## 8. Post-release checklist

Remind the user about any manual steps needed:
- If new migrations exist: "Run `npx supabase db push` against production"
- If new env vars were added: "Add them in Vercel Environment Variables"
- Confirm the Vercel deploy succeeds

## Important rules

- NEVER skip asking the user to approve the changelog entry
- NEVER push without user confirmation
- If the pre-push hook fails (missing changelog entry), fix the issue and retry
- Today's date for the changelog is: use the current date
- The `package.json` version must match the tag (without the `v` prefix)
