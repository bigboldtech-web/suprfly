# Suprfly Rebuild — Smoke Test Plan

End-to-end manual verification for the workflow-paradigm rebuild.

## 0. Prerequisites

You need running locally:
- Docker (for Postgres + Redis): `docker compose up -d`
- Backend: `cd backend && npm run dev`
- Dashboard: `cd dashboard && npm run dev`
- Chrome Extension loaded unpacked from `extension/`

After Docker is up:
```bash
cd backend
npm run db:push       # creates the new schema
npm run db:seed       # creates demo@suprfly.io / suprfly123!
```

## 1. Backend boots clean

- [ ] `npm run dev` (in `backend/`) — no schema errors, server logs "Suprfly API running on port 5000".
- [ ] `curl http://localhost:5000/health` → `{ "status": "ok", ... }`
- [ ] BullMQ admin: open `http://localhost:5000/admin/queues` — all 6 queues listed (post-discovery, comment-generation, comment-posting, session-health, daily-reset, stats-poll).

## 2. Auth + Dashboard shell

- [ ] Open `http://localhost:3000`. Should redirect to `/login`.
- [ ] Login: `demo@suprfly.io` / `suprfly123!`.
- [ ] Sidebar shows: Analytics, Accounts, Tones, Workflows, Comments (+ bottom: Chrome Extension, Affiliate Program, Help).
- [ ] Topbar: Global Daily Quota progress bar, "Unlimited accounts" pill, Plan badge, avatar.

## 3. Accounts page

- [ ] Two columns: X (Twitter) Accounts, LinkedIn Accounts. Each shows count badge.
- [ ] Seeded accounts (`demouser` on X, `Demo User` on LinkedIn) appear with `Inactive` status (since sessionValid=false until real cookies).
- [ ] Below each account: Account Daily Quota bar (0/50).
- [ ] Nested workflows appear under each account.
- [ ] "Connect new account" button opens Chrome Web Store (placeholder).

## 4. Connect a real account via the Chrome Extension

- [ ] Log in to X.com in another tab.
- [ ] Open Suprfly extension popup → log in with `demo@suprfly.io`.
- [ ] Click "Connect X". Toast: "X connected!"
- [ ] Refresh Accounts page in dashboard — your real X account appears as Active.
- [ ] (Optional, LinkedIn personal) Same with LinkedIn.
- [ ] (Optional, LinkedIn company) After personal LinkedIn is connected, the extension should be able to call `LIST_MANAGED_ORGS` and then `CONNECT_COMPANY` with an org URN — UI for this is wired in the background script; popup UI surface is left as a follow-up enhancement.

## 5. Tones page

- [ ] Two seeded tones present: "Professional" and "Bold & Sharp".
- [ ] Click each: form pre-fills with Interaction Style + Writing Style.
- [ ] Edit "Professional" → change Interaction Style to "Curious" → Save. Toast: "Tone saved".
- [ ] Click "Add a new Tone" → enter name "Test Tone" → appears in list.
- [ ] Try to delete a tone that's bound to a workflow → expect 409 with workflow names.
- [ ] Custom prompt link reveals a textarea below the form.

## 6. Workflows page

- [ ] Two seeded workflows: "X Engagement — Tech" (Keywords) and "LinkedIn Engagement — Leadership" (Creators).
- [ ] Select first workflow:
  - [ ] Target Type toggle defaults to "Target Keywords"
  - [ ] Account dropdown lists both connected accounts
  - [ ] Tone dropdown lists Professional + Bold & Sharp
  - [ ] Timezone dropdown lists 8 IANA zones
  - [ ] Review & Approve toggle works
  - [ ] Language, Comment Tone, Emoji Usage, Comment Length controls all interactive
  - [ ] Target Keywords section: 5 chips visible. Type "test keyword" + Add → 6th appears (warn that limit is 5)
  - [ ] Comments By Day slider: drag from 10 → 30 → 50; remaining-quota label updates
  - [ ] Reset reverts unsaved changes
  - [ ] Save → toast "Workflow saved"
- [ ] Switch to second workflow (Creators):
  - [ ] Target Creators section shows 5 chips. Paste a Twitter URL → new chip appears.
- [ ] Create new workflow via "Add a new Workflow"
- [ ] Activate/Deactivate toggle in the top-right works

## 7. Discovery → Comment → Review → Post (cron-driven)

This requires real session cookies on the connected accounts.

- [ ] Wait up to 10 min (or manually trigger via BullMQ admin: enqueue a `discover-<workflowId>` job in `post-discovery` queue).
- [ ] Check BullMQ admin → post-discovery job completes; comment-generation jobs are enqueued for new posts.
- [ ] Comments page → Pending Review tab — generated comments appear.
- [ ] Approve one (✓): toast "Comment approved — queued for posting". Comment leaves Pending tab.
- [ ] Edit another (pencil) → modify text → save (✓).
- [ ] Reject a third (×) → toast "Comment rejected".
- [ ] After ~30-90 seconds (rate-limit delay), Posted tab should show the approved one.

## 8. Stats polling

- [ ] After ~30 min (or manually trigger the `stats-poll` queue), Posted comments should show likes/replies/views in the Stats column (real values depend on platform API stubs being filled in).

## 9. Analytics

- [ ] Dashboard top: "All systems running — N comments posted in last 24h" banner.
- [ ] 4 stat cards: Comments today, Impressions today, Likes today, Followers today.
- [ ] Line chart renders with 3 series. Switch range (24h / 7d / 30d) — chart re-renders.
- [ ] FAQ accordion expands/collapses.
- [ ] Topbar Global Daily Quota progress bar updates as comments post.

## 10. Export

- [ ] Comments page → filter to a workflow → click "Export Comments" → CSV downloads.
- [ ] CSV columns: date, posted_at, workflow, account, account_kind, platform, target, target_type, comment, likes, replies, views, status, post_url.

## 11. Plan limits

- [ ] Workflows page: change dailyLimit to > 50 → backend should clamp to 50.
- [ ] Add 6th keyword on a workflow → 403 "Keyword limit reached (5)".
- [ ] Add 21st creator → 403 "Creator limit reached (20)".

## 12. Quota enforcement

- [ ] When global daily quota hits user's `maxCommentsDayGlobal` → discovery worker logs "GLOBAL — skipping discovery"; post worker returns to backlog.
- [ ] When an account hits 50 → "ACCOUNT" gate.
- [ ] When a workflow hits its `dailyLimit` → "WORKFLOW" gate.

## Known follow-ups (not in scope for this rebuild)

- Real LinkedIn `getManagedOrganizations` data shape may need adjustment once tested with live cookies.
- `fetchCommentStats` (LinkedIn) / `fetchTweetStats` (Twitter) stubs need real Voyager / GraphQL endpoints to return non-zero values.
- Connect-new-account button currently links to the Chrome Web Store; replace with the actual published listing URL.
- Extension popup currently has no UI for the company-page picker — backend + background message handlers are ready, popup just needs to call `LIST_MANAGED_ORGS` and surface the chooser.
