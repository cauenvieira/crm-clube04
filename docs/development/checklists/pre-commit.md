# Checklist - Pre Commit

- [ ] Scope delivered without unrelated refactor.
- [ ] No real data, secrets, tokens, dumps, or `.env` in staged files.
- [ ] `npm run verify:all` executed sequentially and passed.
- [ ] Frontend change includes `npm run verify:frontend`.
- [ ] Docs updated for contract/usage changes.
- [ ] `git status --short` reviewed.
- [ ] `git diff --stat` reviewed.
- [ ] No `git add -A` used.
- [ ] Commit message matches actual change scope.

