DROP INDEX "companies_ats_slug_key";--> statement-breakpoint
CREATE UNIQUE INDEX "companies_ats_slug_key" ON "companies" USING btree ("ats",lower("slug"));