# n8n Automation

Automated job discovery pipeline. It finds engineering roles at startups that hire from
Argentina / LATAM, filters out the noise, and writes the results into PostgreSQL, where the
Next.js app reads them.

No data is ever written by hand: the only manual step is adding a company that the discovery
workflow could not find on its own.

```
YC API ─────────────┐
Job aggregator ─────┤→  n8n  →  PostgreSQL  →  Next.js API  →  Frontend
ATS APIs ───────────┘
(Ashby, Greenhouse, Lever)
```

---

## Workflows

| File | Name in n8n | Trigger | Purpose |
|---|---|---|---|
| `1-process-chunk-sub.json` | Job Hunter 1 - Process chunk (sub) | Called by workflow 2 | Downloads and parses one aggregator chunk |
| `2-discover-companies-DB.json` | Job Hunter 2 - Discover companies (DB) | Mondays 08:00 (AR) | Finds companies → `companies` table |
| `3-daily-jobs-DB.json` | Job Hunter 3 - Daily jobs (DB) | Daily 09:00 and 18:00 (AR) | Finds job postings → `jobs` table |

Workflow 3 runs twice a day because n8n is self-hosted; if the machine is asleep at 09:00 the
second run still catches the day. Duplicate runs are harmless (see *Idempotency*).

### 1 — Process chunk (sub-workflow)

The aggregator publishes ~1.4M job postings split into ~58 gzipped chunks. Loading them all at
once exhausts n8n's memory (a single run produced 184 MB of execution data and the editor could
not render it). This sub-workflow processes **one chunk at a time** and returns only the
companies that matter, so memory is released between chunks.

`Receive chunk → Download chunk → Tag as gzip → Decompress → Parse JSON → LATAM companies in chunk`

It must be **published** — n8n only allows a workflow to call another one if the callee is active.

### 2 — Discover companies

```
Read aggregator index → Chunk list → Process each chunk ─┐
                                                          ├→ Merge → Build companies SQL → Save companies
Google queries → Search Google (Serper, disabled) ────────┘
```

Output: one row per company in `companies` (`slug`, `ats`, `name`, `hq`, `source`, `status`).

A company is kept only if it has **at least one engineering posting mentioning Argentina or
LATAM**. Known consultancies / staffing agencies are inserted with `status = 'inactive'` so they
never reach workflow 3; flip the status manually if you want one back.

The Serper (Google) branch is **disabled by default**. Enable it to catch companies the
aggregator does not index (Span, for example, is missing from it). It needs a Header Auth
credential named `X-API-KEY` with a serper.dev key.

### 3 — Daily jobs

```
Get user → Read ignored keywords → Read Companies → Fetch ATS jobs → Filter ATS ─┐
        └→ Fetch YC → Filter YC ───────────────────────────────────────────────── ┤
                                                                                   ├→ Merge sources
                                   Filter ignored → Build jobs SQL → Save jobs ←───┘
```

Two independent sources are merged, filtered and written in a **single SQL statement**.

---

## Data sources

| Source | Endpoint | Notes |
|---|---|---|
| Y Combinator | `devasheeshg.github.io/yc-api/companies/hiring.json` | One file, rebuilt daily, includes each company's open postings, `team_size`, `batch`, `linkedin_url` and a `visa` field |
| Job aggregator | `raw.githubusercontent.com/Feashliaa/job-board-data` | ~1.4M postings across Ashby / Greenhouse / Lever / Workday, rebuilt daily. Used only to **discover companies**, never as the source of postings — it stores a single `location` per posting and would hide roles whose LATAM location is secondary |
| Ashby | `api.ashbyhq.com/posting-api/job-board/{slug}?includeCompensation=true` | Public, no auth. Returns `secondaryLocations` and salary |
| Greenhouse | `boards-api.greenhouse.io/v1/boards/{slug}/jobs` | Public, no auth |
| Lever | `api.lever.co/v0/postings/{slug}?mode=json` | Public, no auth. One item per posting |

Both third-party datasets are community projects. If either stops updating, the pipeline keeps
running but with stale data — check `meta.json` / the repo's last commit date if results look
frozen.

---

## Filtering rules

Applied in `Filter ATS` and `Filter YC` (same logic, different input shapes).

**1. Engineering only.** Title or YC `role` must match `IS_ENGINEERING`; titles matching
`EXCLUDE` (recruiter, sales, marketing, designer, intern…) are dropped.

**2. Location.** This is the core of the pipeline — a naive "remote" filter returns mostly
US-only roles.

| Location string | Result | `location_match` |
|---|---|---|
| contains Argentina / Buenos Aires / `AR` | `yes` | `argentina_in_location` |
| contains LATAM / Latin America / Americas | `yes` | `latam_in_location` |
| exactly `Remote` / `Anywhere` / `Worldwide` | `maybe` | `remote_no_country` |
| same, and visa not required | `maybe` | `remote_visa_not_required` |
| `Remote (US)`, `San Francisco / Remote`, `Mexico City` | dropped | — |

`San Francisco / Remote` is dropped on purpose: in practice it means *remote within the US*.
A description containing "must be based in the United States" or "citizen/visa only"
downgrades a `maybe` to dropped.

**3. Salary.** Postings are dropped when the published maximum is below `MIN_SALARY_K`
(default 60, in thousands of USD/year). Ranges under 20 are treated as monthly and multiplied
by 12, so `$4K - $7K` becomes 84. Postings without a published salary are always kept.

**4. Ignored keywords.** `Filter ignored` reads the `ignored_keywords` table (managed from the
frontend) and drops postings whose title contains any of them as a **whole word** — `QA`
removes "Senior QA Engineer" but not "Quality Analyst".

**5. Priority.** Not a filter, just ordering:

| `role_category` | `priority` | Matches |
|---|---|---|
| `manager` | 1 | manager, head of, director, VP, CTO |
| `lead_staff` | 2 | lead, staff, principal, forward deployed, product engineer, founding |
| `ic` | 3 | everything else |

---

## Database writes

Both write nodes build **one statement per run** and pass the rows as a single JSON parameter
(`jsonb_to_recordset($1::jsonb)`).

> Values are never inlined into the SQL text. n8n's Postgres node uses pg-promise, which
> substitutes `$1`-style placeholders **anywhere in the query, including inside quoted
> literals** — so a salary like `$180K` silently breaks the statement. Keeping data in the
> parameter also removes any injection risk.

### Idempotency

`jobs` — conflict on `(user_id, external_id)`:

| Column | On re-run |
|---|---|
| `last_seen_at` | always set to today |
| `published_at` | kept at the newest of the two |
| `republished_at` | set to today **only** when the incoming `published_at` is newer |
| `locations`, `salary`, `salary_max_k`, `company_hq`, `company_size` | refreshed |
| `status`, `notes`, `applied_at`, `description` | **never touched** |

A posting that already exists under a different `external_id` with the same company + title
(same role found through two sources) is skipped by the `NOT EXISTS` clause.

`companies` — conflict on `(ats, slug)`: only fills `hq` when it was empty. Manual edits
(`status`, `linkedin_slug`, `sector`…) survive every run.

Because of this, running any workflow twice in a row is safe and produces no duplicates.

---

## Setup

Prerequisites: self-hosted n8n, a Postgres credential pointing at the app database, and the
schema from `docs/` already applied.

1. Import `1-process-chunk-sub.json` → **Publish**. Nothing to configure.
2. Import `2-discover-companies-DB.json`
   - `Process each chunk` → Workflow: *Job Hunter 1 - Process chunk (sub)*
   - `Save companies` → Postgres credential
   - Run once manually (2–4 min), then **Publish**
3. Import `3-daily-jobs-DB.json`
   - `Get user`, `Read ignored keywords`, `Read Companies`, `Save jobs` → Postgres credential
   - Run once manually, then **Publish**

Each workflow's **Settings → Timezone** must be `America/Argentina/Buenos_Aires`, otherwise the
schedules fire in UTC.

### Adding a company manually

```sql
INSERT INTO companies (slug, ats, name, hq, sector, size, source, linkedin_slug, status)
VALUES ('span.app', 'ashby', 'Span', 'San Francisco, CA, USA', 'AI', 30, 'manual', 'getspan', 'active')
ON CONFLICT (ats, slug) DO NOTHING;
```

`slug` is the identifier in the job board URL (`jobs.ashbyhq.com/<slug>`), `ats` is one of
`ashby | greenhouse | lever`. Workflow 3 picks it up on its next run.

To stop pulling from a company: `UPDATE companies SET status = 'inactive' WHERE slug = '…';`

---

## Tuning

| What | Where |
|---|---|
| Minimum salary | `MIN_SALARY_K` at the top of `Filter ATS` and `Filter YC` |
| Which titles count as engineering | `IS_ENGINEERING` / `EXCLUDE` regexes, same nodes |
| Location rules | `classify()`, same nodes |
| Priority buckets | `MANAGER` / `LEAD` regexes, same nodes |
| Agency list | `AGENCIES` in `Build companies SQL` |
| Schedules | Schedule Trigger nodes |

The two filter nodes share the same header block. Edit both or they will drift apart.

---

## Troubleshooting

**`Syntax error at line N near "$1"`** — a salary value leaked into the SQL text. The build
nodes must pass rows through *Options → Query Parameters* (`{{ $json.params }}`), not inline them.

**`Chunk list` returns 1 item instead of ~58** — GitHub returned the manifest as a string in
`data`. The node parses both shapes; if it regressed, check `JSON.parse(d.data)`.

**`Please execute the whole workflow, rather than just the node`** — leftover execution data is
too large. *Clear execution*, then run the full workflow.

**`This execution's data is too large to display`** — the run succeeded, the editor just cannot
render it. Reduce what the nodes emit rather than raising limits.

**Nothing new appears for days** — check the two upstream datasets' last-updated dates, and that
Docker / the host machine was awake at the scheduled times.

**Postgres connection refused** — Neon suspends idle branches; the first query may fail and the
retry succeed. Also confirm SSL is set to *Require*.

---

## Known limitations

- Salary is assumed to be USD; ranges published in GBP/EUR are compared as if they were dollars.
- `company_hq` is inferred from the most frequent on-site location across a company's postings
  when the source does not provide it, so it can be empty or approximate.
- Closed postings are not removed. `last_seen_at` tracks freshness — use it if you want to hide
  or archive stale rows.
- The aggregator's coverage is wide but not complete; enable the Serper branch to fill gaps.

## Roadmap

- LinkedIn check (headcount in Argentina per company) → `companies.employees_ar`
- Company enrichment with an LLM: funding round, sector, role summary
- Blacklist managed from the frontend