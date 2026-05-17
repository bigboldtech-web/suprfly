# Suprfly v2.0 — Production Deployment Checklist

> Manual deployment runbook for the workflow-paradigm rebuild. Verify each step before executing the next. Do not run blindly.

## Pre-flight

- [ ] All 24 BlitzIt "Suprfly Rebuild" tasks marked done (or backlog noted)
- [ ] `backend/` + `dashboard/` typecheck clean: `(cd backend && npx tsc --noEmit) && (cd dashboard && npx tsc --noEmit)`
- [ ] `dashboard/` builds: `(cd dashboard && npx next build)`
- [ ] Smoke-tested locally end-to-end per `SMOKE-TEST.md`
- [ ] Git: branch is rebased and ready, commit message references "v2.0.0-workflow"

## Environment variables

No new environment variables are introduced by v2.0. The existing `backend/.env.production.template` covers all required values. Re-verify on the VPS:

```bash
ssh suprfly@vps.suprfly.io
cd /home/suprfly/apps/suprfly/backend
diff .env .env.production.template   # confirm all required keys present
```

## Database migration

⚠️ **PRODUCTION DATA WARNING**: v2.0 is a breaking schema change (Workflow as first-class entity, Tone as standalone, Keyword/Creator re-parented to Workflow, Comment status enum renamed). If there is real production data, you cannot just `db:push --force-reset`. Pick one path:

### Path A — Greenfield (no prod users yet)

```bash
cd backend
npx prisma migrate reset --force         # destroys all data
npx prisma migrate deploy                 # applies migrations
npx prisma db seed                        # seeds demo user
```

### Path B — There is production data

You will need a data migration. Outline (DO NOT RUN unattended):

1. `pg_dump` the prod DB.
2. Create migration `prisma/migrations/v2_workflow_paradigm.sql` that:
   - Adds new tables: `tones`, `workflows`, `linkedin_organizations`.
   - Adds new columns: `users.maxWorkflowsPerAccount`, `users.maxCommentsDayGlobal`, `users.globalCommentsTodayCount`, `users.globalCommentsTodayDate`, `connected_accounts.accountKind`, `connected_accounts.organizationId`, `workflows.commentsTodayCount`, comment stats columns.
   - Backfills: for each `ToneSettings`, create a `Tone` with same user; for each account's keywords/creators, create one default Workflow and migrate them.
   - Renames `CommentStatus.PENDING` → `PENDING_REVIEW`.
   - Drops `prompt_builders`, `tone_settings`, old `Keyword.accountId` / `Creator.accountId`, the stripped account columns.
3. Test migration on a restored dump in staging.
4. Apply in a maintenance window: stop API + workers, run migration, redeploy.

## Build & ship — Backend

```bash
ssh suprfly@vps.suprfly.io
cd /home/suprfly/apps/suprfly
git fetch origin && git checkout v2.0.0-workflow
cd backend
npm ci
npx prisma generate
# (Path A or B from above)
npm run build
pm2 restart suprfly-api
pm2 logs suprfly-api --lines 80   # confirm "All BullMQ workers started" incl. stats-poll
```

## Build & ship — Dashboard

```bash
cd /home/suprfly/apps/suprfly/dashboard
npm ci
npm run build
pm2 restart suprfly-dashboard
pm2 logs suprfly-dashboard --lines 40
```

## Nginx

No new routes — existing config still forwards `/api/v1/*` to backend and root to Next.js. No reload needed.

## Chrome Extension v2.0.0

The extension has bumped to v2.0.0. Submit to Chrome Web Store:

```bash
cd extension/
zip -r ../suprfly-extension-v2.zip . -x ".*"
# Upload via Chrome Web Store developer dashboard
```

The new code adds `LIST_MANAGED_ORGS` and `CONNECT_COMPANY` message handlers — backward compatible with old popup UI.

## Post-deploy smoke

```bash
curl -fsS https://api.suprfly.io/health     # → {"status":"ok",...}
curl -fsS https://app.suprfly.io/login      # → HTML, 200
```

Then in a browser:
- [ ] `https://app.suprfly.io` → login → sidebar shows new nav (Analytics / Accounts / Tones / Workflows / Comments)
- [ ] Top bar shows Global Daily Quota progress
- [ ] BullMQ admin at `https://api.suprfly.io/admin/queues` lists 6 queues including `stats-poll`

## Rollback

If something is wrong:
```bash
ssh suprfly@vps.suprfly.io
cd /home/suprfly/apps/suprfly
git checkout previous-release-tag
(cd backend && npm run build && pm2 restart suprfly-api)
(cd dashboard && npm run build && pm2 restart suprfly-dashboard)
# For Path B, restore the pg_dump
```

## Tag the release

```bash
git tag -a v2.0.0-workflow -m "Workflow paradigm rebuild (Powerin-style)"
git push origin v2.0.0-workflow
```

---

**⚠️ This runbook is a guide, not an automation.** Every step needs a human to confirm before running it.
