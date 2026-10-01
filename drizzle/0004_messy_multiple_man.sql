CREATE TABLE "tracker_columns" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"title" text NOT NULL,
	"badge" text NOT NULL,
	"wrapper_bg" text NOT NULL,
	"card_bg" text NOT NULL,
	"card_hover" text NOT NULL,
	"order_index" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tracker_config" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"options" jsonb DEFAULT '{"instanciaCierre": [], "categoriaCierre": []}' NOT NULL,
	"field_order" jsonb,
	"custom_properties" jsonb,
	CONSTRAINT "tracker_config_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "tracker_jobs" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"column_id" text NOT NULL,
	"name" text NOT NULL,
	"role" text,
	"location" text,
	"salario_mensual" integer,
	"salario_anual" integer,
	"moneda_salario" text DEFAULT 'USD',
	"beneficios" text,
	"contras" text,
	"ingles_requerido" text,
	"hands_on" text,
	"idioma_posicion" text,
	"tipo_contratacion" text,
	"forma_pago" text,
	"plataforma" text,
	"link_posicion" text,
	"link_empresa" text,
	"contacto_recruiter" text,
	"contacto_leader" text,
	"jd" text,
	"link_notion" text,
	"notion_id" text,
	"instancia_cierre" text,
	"categoria_cierre" text,
	"motivo_rechazo" text,
	"closed_at" timestamp with time zone,
	"custom_props" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tracker_columns" ADD CONSTRAINT "tracker_columns_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tracker_config" ADD CONSTRAINT "tracker_config_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tracker_jobs" ADD CONSTRAINT "tracker_jobs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tracker_jobs" ADD CONSTRAINT "tracker_jobs_column_id_tracker_columns_id_fk" FOREIGN KEY ("column_id") REFERENCES "public"."tracker_columns"("id") ON DELETE cascade ON UPDATE no action;