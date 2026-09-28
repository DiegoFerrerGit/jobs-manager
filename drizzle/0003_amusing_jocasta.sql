CREATE TABLE "user_cvs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"content" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_cvs_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "expected_salary" text;--> statement-breakpoint
ALTER TABLE "user_cvs" ADD CONSTRAINT "user_cvs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;