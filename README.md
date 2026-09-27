# Jobs Manager (Hunter)

Jobs Manager is a specialized tool that automates the discovery, filtering, and tracking of engineering roles at startups that hire from Argentina / LATAM. It provides a clean, Notion-like Kanban interface to review, organize, and track your applications.

## 🌟 Features

- **Automated Discovery:** A standalone n8n pipeline scrapes YCombinator, Ashby, Greenhouse, and Lever APIs daily.
- **Smart Filtering:** Automatically filters out non-engineering roles, incompatible locations, low salaries, and user-defined ignored keywords.
- **Rich Kanban Board:** Drag-and-drop Kanban interface designed to replicate the Notion experience.
- **Advanced Sorting & Filtering:** Sort by priority, salary, date, and filter by LATAM compatibility.
- **Built-in CV Editor (`/cv`):** In-browser Typst IDE to code, render (PDF), and save your ATS-optimized resume directly within the platform.
- **Optimized Data Flow:** n8n safely upserts data into PostgreSQL without touching user-managed columns (like application status or notes).
- **Modern Tech Stack:** Built with Next.js 14, Drizzle ORM, TailwindCSS, and PostgreSQL.

## 📚 Documentation

The documentation is split into specific areas for deep dives:

- [Architecture](./docs/architecture.md) — Detailed explanation of the data flow, database schema, and design decisions.
- [Deployment](./docs/deployment.md) — Instructions on how to deploy the Next.js app to Vercel and the DB to Neon.
- [n8n Automation Pipeline](./n8n/README.md) — A complete guide to the n8n scheduled scraping and parsing workflows.

## 🚀 Getting Started Locally

### Prerequisites
- Node.js (v18+)
- PostgreSQL (Local or Neon)
- [n8n](https://n8n.io/) (Self-hosted via Docker or desktop app)

### 1. Database Setup
Ensure you have a PostgreSQL instance running. Copy the environment variables:
```bash
cp .env.example .env.local
```
Edit `.env.local` and add your database URL.

### 2. Push Schema & Seed Data
Push the Drizzle schema to your local database and populate it with mock data:
```bash
npx drizzle-kit push
source .env.local && export DATABASE_URL && npx tsx src/db/seed.ts
```

### 3. Run the App
Start the Next.js development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser.

## 🏗️ Architecture Overview

The system consists of three main decoupled components:

1. **Next.js application** (Frontend & API)
2. **PostgreSQL database** (Neon)
   - `jobs` — job postings with their classification (priority, Argentina fit, salary) and application status
   - `companies` — job boards to poll, written by n8n
   - `ignored_keywords` — title keywords to filter out, managed from the app
   - `user_cvs` — Stores Typst source code of user CVs
   - `users`, `sessions`, `allowlist` — Auth layer
3. **n8n automation** (Self-hosted)
   - Discovers companies hiring from Argentina / LATAM (weekly)
   - Polls their job boards and the YC dataset (twice daily)
   - Filters by role, location, salary, and ignored keywords
   - Upserts results into PostgreSQL

### Flow
```text
 YC API · job aggregator · ATS APIs
                ↓
         n8n (scheduled)
                ↓
          PostgreSQL  ←→  Next.js API  ←→  Frontend
```

Read more in [`docs/architecture.md`](./docs/architecture.md).