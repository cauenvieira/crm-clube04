# Checklist - API Feature

- [ ] Scope confirmed (endpoint/contract/rules).
- [ ] Route is thin (no SQL, no complex business rule).
- [ ] Validation schema added/updated.
- [ ] Service contains business logic.
- [ ] Repository contains SQL and persistence only.
- [ ] Errors are controlled and response format is clear.
- [ ] Idempotency/duplicate behavior validated where applicable.
- [ ] `docs/api/rest-api.md` updated with copyable examples.
- [ ] `npm run verify:all` executed sequentially.

