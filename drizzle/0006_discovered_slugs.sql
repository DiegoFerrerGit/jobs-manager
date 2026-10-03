BEGIN;

DO $$ BEGIN
 CREATE TYPE "public"."slug_check_result" AS ENUM('promoted', 'no_latam', 'dead', 'error');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "discovered_slugs" (
	"id" serial PRIMARY KEY NOT NULL,
	"ats" "public"."job_source" NOT NULL,
	"slug" text NOT NULL,
	"source" text NOT NULL,
	"discovered_at" timestamp with time zone DEFAULT now() NOT NULL,
	"checked_at" timestamp with time zone,
	"result" "public"."slug_check_result",
	"jobs_found" integer,
	"latam_jobs" integer,
	"company_id" integer,
	"attempts" smallint DEFAULT 0 NOT NULL,
	"last_error" text
);

DO $$ BEGIN
 ALTER TABLE "discovered_slugs" ADD CONSTRAINT "discovered_slugs_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "discovered_slugs_ats_slug_key" ON "discovered_slugs" USING btree ("ats", "slug");
CREATE INDEX IF NOT EXISTS "discovered_slugs_pending_idx" ON "discovered_slugs" USING btree ("discovered_at") WHERE "checked_at" IS NULL;
CREATE INDEX IF NOT EXISTS "discovered_slugs_checked_at_idx" ON "discovered_slugs" USING btree ("checked_at");

COMMIT;
