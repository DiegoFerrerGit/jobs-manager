# Deployment

The Jobs Manager consists of a Next.js application, a PostgreSQL database, and a self-hosted n8n automation pipeline. Since the application and the automation are completely decoupled, they are deployed separately.

## 1. Database (Neon)

The database acts as the single source of truth and contract between the n8n pipeline and the Next.js app.

1. **Create a Neon project:** Go to [Neon](https://neon.tech) and create a new PostgreSQL project.
2. **Retrieve the Connection String:** Get the `DATABASE_URL` (ensure it uses `sslmode=require` or pooling if necessary).
3. **Run Migrations:**
   Locally, configure your `.env.production` file with the Neon `DATABASE_URL`, and then push the schema:
   ```bash
   # Make sure you have your .env.production setup
   export DATABASE_URL="postgresql://user:password@ep-host.region.aws.neon.tech/neondb?sslmode=require"
   npx drizzle-kit push
   ```

## 2. Next.js App (Vercel)

The frontend and API are designed to run seamlessly on Vercel.

1. **Import the repository:** Go to your Vercel dashboard and import the GitHub repository.
2. **Environment Variables:** Set the following variables in the Vercel project settings (matching your local `.env.production`):
   - `DATABASE_URL`: The connection string from Neon.
   - `FRONTEND_ORIGIN`: The public URL of your Vercel deployment (e.g. `https://jobs-manager.vercel.app`).
   - `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`: Secure random strings for authentication.
   - `GOOGLE_OAUTH_CLIENT_ID`: If you use Google SSO.
   - `BETA_SIGNUP_SECRET`: Secret key for manual user creation.
3. **Deploy:** Vercel will automatically build (`npm run build`) and deploy the application.

## 3. n8n Automation (Self-hosted)

The n8n pipeline is responsible for scraping, filtering, and inserting jobs into the database on a schedule.

1. **Host n8n:** You can host n8n locally via Docker, or on a cheap VPS (like DigitalOcean, Hetzner, or AWS EC2).
   ```bash
   docker run -it --rm \
     --name n8n \
     -p 5678:5678 \
     -e N8N_SECURE_COOKIE=false \
     -v ~/.n8n:/home/node/.n8n \
     n8nio/n8n
   ```
2. **Configure Postgres Credentials:** In n8n, create a new "Postgres" credential pointing to your Neon database.
3. **Import Workflows:** Import the three JSON files located in the `n8n/` directory.
   - `1-process-chunk-sub.json`
   - `2-discover-companies-DB.json`
   - `3-daily-jobs-DB.json`
4. **Set Timezone:** Ensure every workflow's Settings -> Timezone is set to `America/Argentina/Buenos_Aires` (or your local timezone) so schedules fire correctly.
5. **Activate:** Publish/Activate the workflows. Workflow 2 runs weekly, and Workflow 3 runs twice daily.

Detailed documentation on how the n8n workflows operate can be found in [`n8n/README.md`](../n8n/README.md).
