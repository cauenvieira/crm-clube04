# Checklist - Integration

- [ ] Provider contract documented (input/output/errors).
- [ ] Secrets loaded from env only.
- [ ] No hardcoded token, key, or credential.
- [ ] Retry/idempotency behavior defined.
- [ ] Timeout/failure path handled with clear logs.
- [ ] Versioned assets kept in repo when applicable (ex.: n8n workflow JSON).
- [ ] MCP usage kept controlled (no credential mutations without approval).
- [ ] `npm run verify:all` executed sequentially.

