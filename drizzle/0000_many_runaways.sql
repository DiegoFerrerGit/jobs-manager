CREATE TYPE "public"."argentina_fit" AS ENUM('yes', 'maybe');--> statement-breakpoint
CREATE TYPE "public"."company_status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."job_source" AS ENUM('yc', 'ashby', 'greenhouse', 'lever', 'manual', 'teamtailor', 'workday', 'oracle', 'workable', 'custom');--> statement-breakpoint
CREATE TYPE "public"."job_status" AS ENUM('SAVED', 'APPLIED', 'INTERVIEWING', 'OFFER', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."role_category" AS ENUM('manager', 'lead_staff', 'ic');--> statement-breakpoint
CREATE TABLE "allowlist" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "allowlist_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"ats" "job_source" NOT NULL,
	"name" text NOT NULL,
	"hq" text,
	"sector" text,
	"size" integer,
	"stage" text,
	"linkedin_url" text,
	"linkedin_slug" text,
	"employees_ar" integer,
	"linkedin_checked_at" date,
	"source" text,
	"status" "company_status" DEFAULT 'active' NOT NULL,
	"careers_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "favorite_companies" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"company_name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ignored_keywords" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"keyword" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"external_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"apply_url" text NOT NULL,
	"locations" text,
	"published_at" date,
	"republished_at" date,
	"detected_at" date DEFAULT CURRENT_DATE NOT NULL,
	"last_seen_at" date DEFAULT CURRENT_DATE NOT NULL,
	"priority" smallint DEFAULT 3 NOT NULL,
	"role_category" "role_category" DEFAULT 'ic' NOT NULL,
	"accepts_argentina" "argentina_fit" NOT NULL,
	"location_match" text,
	"source" "job_source" NOT NULL,
	"salary" text,
	"salary_max_k" integer,
	"salary_currency" char(3) DEFAULT 'USD',
	"company_id" integer,
	"company" text NOT NULL,
	"company_slug" text,
	"company_hq" text,
	"company_size" integer,
	"company_stage" text,
	"company_linkedin" text,
	"linkedin_people_ar" text,
	"status" "job_status" DEFAULT 'SAVED' NOT NULL,
	"notes" text,
	"applied_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"refresh_token_hash" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"picture" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_public_id_unique" UNIQUE("public_id"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "favorite_companies" ADD CONSTRAINT "favorite_companies_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ignored_keywords" ADD CONSTRAINT "ignored_keywords_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "companies_ats_slug_key" ON "companies" USING btree ("ats","slug");--> statement-breakpoint
CREATE INDEX "companies_status_idx" ON "companies" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "favorite_companies_user_company_key" ON "favorite_companies" USING btree ("user_id",lower("company_name"));--> statement-breakpoint
CREATE UNIQUE INDEX "ignored_keywords_user_keyword_key" ON "ignored_keywords" USING btree ("user_id","keyword");--> statement-breakpoint
CREATE UNIQUE INDEX "jobs_user_external_key" ON "jobs" USING btree ("user_id","external_id");--> statement-breakpoint
CREATE UNIQUE INDEX "jobs_user_company_title_key" ON "jobs" USING btree ("user_id",lower("company"),lower("title"));--> statement-breakpoint
CREATE INDEX "jobs_user_status_idx" ON "jobs" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "jobs_user_priority_idx" ON "jobs" USING btree ("user_id","priority","salary_max_k");--> statement-breakpoint
CREATE INDEX "jobs_detected_idx" ON "jobs" USING btree ("user_id","detected_at");--> statement-breakpoint
CREATE INDEX "jobs_company_idx" ON "jobs" USING btree ("company_id");