# Architecture

## Overview

Jobs Manager finds engineering roles at startups that actually hire from Argentina / LATAM,
and gives you one place to review and track them.

The system is split into three pieces that only talk to each other through the database.

```
 YC API · job aggregator · ATS APIs
                ↓
         n8n (scheduled)
                ↓
          PostgreSQL  ←→  Next.js API  ←→  Frontend
```

n8n never calls the app, and the app never calls n8n. PostgreSQL is the contract between them:
n8n writes `jobs` and `companies`, the app reads them and owns everything the user edits.
Either side can be restarted, redeployed or replaced without touching the other.

| Component | Stack | Hosting |
|---|---|---|
| Frontend + API | Next.js | Vercel |
| Database | PostgreSQL | Neon |
| Automation | n8n | Self-hosted (Docker) |

---

## Data flow

**Weekly — company discovery.** n8n reads a public dataset of ~1.4M job postings, keeps the
companies that have at least one engineering role open to Argentina or LATAM, and upserts them
into `companies` with the job board they publish on (Ashby, Greenhouse or Lever).

**Twice daily — job collection.** n8n polls the official API of every active company, plus the
Y Combinator dataset, filters the postings by role, location, salary and the user's ignored
keywords, and upserts the survivors into `jobs`.

**On demand — the app.** The user browses, filters and marks postings as applied. Those edits
live in columns that n8n never writes.

Full detail of the sources, filtering rules and schedules is in [`n8n/README.md`](../n8n/README.md).

---

## Database

### Tables

| Table | Written by | Purpose |
|---|---|---|
| `jobs` | n8n (+ user status) | Job postings and their classification |
| `companies` | n8n (+ manual edits) | Job boards to poll |
| `ignored_keywords` | App | Title keywords to filter out |
| `users`, `sessions`, `allowlist` | App | Authentication |

### Ownership of `jobs` columns

This split is what makes the pipeline safe to re-run at any time.

| Owner | Columns |
|---|---|
| n8n | `external_id`, `title`, `apply_url`, `locations`, `published_at`, `republished_at`, `detected_at`, `last_seen_at`, `priority`, `role_category`, `accepts_argentina`, `location_match`, `source`, `salary`, `salary_max_k`, all `company_*` |
| User / app | `status`, `notes`, `applied_at` |
| Future (LLM enrichment) | `description` |

### Key types

```sql
job_status     = SAVED | APPLIED | INTERVIEWING | OFFER | REJECTED
role_category  = manager | lead_staff | ic          -- priority 1 | 2 | 3
argentina_fit  = yes | maybe                         -- 'no' is never stored
job_source     = yc | ashby | greenhouse | lever | manual
company_status = active | inactive
```

Full DDL: [`job-hunter-schema.sql`](./job-hunter-schema.sql).

---

## Design decisions

### Company data is duplicated inside `jobs`

`company_hq`, `company_size`, `company_stage` and `company_linkedin` are copied onto every row
even though `company_id` points at `companies`.

The listing is the only hot path in the app and it renders those fields on every card, so
denormalising removes a join from the most frequent query. It also means postings from Y
Combinator — whose companies are not in `companies` at all, because that dataset ships its own
company metadata — carry the same shape as the rest. The copies are a snapshot at insert time;
`companies` stays the source of truth for polling.

### Deduplication happens twice

A posting is rejected if either check matches:

1. `UNIQUE (user_id, external_id)` — the same posting seen again.
2. `UNIQUE (user_id, lower(company), lower(title))` — the same role found through a different
   source.

The second one exists because a single company frequently appears in both the YC dataset and its
own Ashby board, with different ids for the same job. Without it the list shows visible
duplicates, which is exactly the kind of noise the product is meant to remove.

### Writes are upserts, never deletes

Every run re-sends the full current set of postings. `ON CONFLICT … DO UPDATE` refreshes the
volatile fields (salary, locations, dates) and leaves user-owned columns untouched. Nothing is
deleted, so a source going temporarily empty cannot wipe the list.

`last_seen_at` records the last run in which a posting was still published; `republished_at` is
set only when a posting's publication date moves forward, which is how reposted roles surface
again without losing their history.

### One statement per run, data passed as a parameter

Each write node builds a single `INSERT … SELECT FROM jsonb_to_recordset($1::jsonb)` and passes
the rows as one JSON parameter.

One round trip replaces ~150 sequential writes, and keeping values out of the SQL text avoids a
subtle failure: n8n's Postgres node substitutes `$1`-style placeholders anywhere in the query,
including inside quoted literals, so a salary such as `$180K` corrupts the statement. It also
makes injection structurally impossible.

### The aggregator finds companies, not jobs

It would be cheaper to read postings straight from the aggregated dataset, but it stores a
single `location` per posting. A role listed as `Remote (USA) | Buenos Aires` appears there as
`Remote (USA)` and would be discarded — precisely the roles worth finding. So the aggregator is
used only to learn *which* companies to poll, and the postings always come from each ATS's own
API, which returns every location.

### `accepts_argentina` has no `no`

Postings that fail the location test are dropped in n8n and never reach the database. Only `yes`
and `maybe` are stored, so the app never has to filter them out and the table stays small.

`maybe` means "remote with no country restriction" — worth a look, but unconfirmed. The
distinction is preserved instead of collapsing both into a boolean because the user treats them
differently when applying.

### Jobs are scoped to a user

`jobs.user_id` exists even though postings are objectively global. It keeps the current
single-user product simple and the auth model uniform.

If the app ever becomes multi-user, the right move is to split the table: a global `jobs` table
plus a `user_jobs` join carrying `status`, `notes` and `applied_at`. That migration is contained
— the ownership split above already draws the line where it would be cut.

---

## Operational notes

- **Scheduling.** n8n runs on a local machine, so workflow 3 fires twice a day; if the host is
  asleep at 09:00, the 18:00 run still collects everything. Re-running is free thanks to the
  upsert semantics.
- **Timezone.** All workflows are pinned to `America/Argentina/Buenos_Aires`; without it n8n
  schedules in UTC.
- **External datasets.** Both upstream datasets are community projects rebuilt daily. If one
  stalls, the pipeline keeps running against stale data — there is no alert for this yet.
- **Neon.** Idle branches suspend; the first query after a pause can fail and the retry succeed.

---

## Roadmap

| Item | Where it lands |
|---|---|
| LinkedIn headcount in Argentina per company | `companies.employees_ar` |
| LLM enrichment: funding round, sector, role summary | `jobs.description`, `companies.sector` / `stage` |
| Blacklist companies from the frontend | new table or `companies.status` |
| Archive postings no longer published | derived from `last_seen_at` |
| Multi-user | split `jobs` / `user_jobs` |