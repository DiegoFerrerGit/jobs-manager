This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Architecture

The system consists of three main components:

1. Next.js application
   - Frontend
   - Backend/API

2. PostgreSQL database (Neon)
   - `jobs` — job postings with their classification (priority,
     Argentina fit, salary) and your application status
   - `companies` — job boards to poll, written by n8n
   - `ignored_keywords` — title keywords to filter out, managed from the app
   - `users`, `sessions`, `allowlist` — auth

3. n8n automation (self-hosted)
   - Discovers companies hiring from Argentina / LATAM (weekly)
   - Polls their job boards and the YC dataset (twice daily)
   - Filters by role, location, salary and ignored keywords
   - Upserts the results into PostgreSQL without overwriting
     application status
   - See `n8n/README.md`

Flow:

YC API · job aggregator · ATS APIs (Ashby, Greenhouse, Lever)
      ↓
     n8n  (discover → fetch → filter → upsert)
      ↓
 PostgreSQL
      ↓
 Next.js API
      ↓
 Frontend