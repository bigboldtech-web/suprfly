# Suprfly

AI-powered auto-commenting SaaS for LinkedIn and X (Twitter). Connect your accounts via a Chrome Extension; Suprfly discovers posts matching your keywords or creators, generates on-brand comments with your configured tone, and either auto-posts or queues for review.

## Monorepo layout

- **backend/** — Node.js + Express + TypeScript API. Prisma + Postgres, BullMQ + Redis workers, Stripe + Razorpay billing, Claude Haiku 4.5 primary AI with GPT-4o-mini fallback.
- **dashboard/** — Next.js 16 dashboard. Five pages: Analytics, Accounts, Tones, Workflows, Comments.
- **extension/** — Chrome MV3 extension that captures session cookies for LinkedIn and X.
- **landing/** — Static marketing site (suprfly.io).
- **website/** — Alternate Next.js marketing site.
- **deploy/** — Nginx config + deployment scripts.

## Architecture (post-v2 rebuild)

**Workflow** is the first-class entity. A Workflow ties together:
- one **ConnectedAccount** (X personal, LinkedIn personal, or LinkedIn company page)
- one **Tone** (reusable across workflows — interaction style + writing style + optional custom prompt)
- a **Target Type** (keyword search or specific creators)
- per-workflow settings (timezone, auto-post vs review, language, comment tone, emoji, length, daily limit)

Quota enforcement is three-tier: global daily / per-account / per-workflow. The `stats-poll` worker fetches engagement (likes / replies / views) for posted comments.

## Local development

```bash
docker compose up -d                           # Postgres + Redis
cd backend && npm install && npm run db:push && npm run db:seed && npm run dev
cd dashboard && npm install && npm run dev
# Load extension/ as unpacked in chrome://extensions
```

Login as `demo@suprfly.io` / `suprfly123!`.

## Deployment

PM2 + Nginx on a Linode VPS. Domains: `suprfly.io` (landing), `app.suprfly.io` (dashboard), `api.suprfly.io` (backend). See `DEPLOY.md`.

## Smoke testing

End-to-end manual checklist in `SMOKE-TEST.md`.
