import {
  pgTable, pgEnum, serial, integer, smallint, text, char, date,
  timestamp, uniqueIndex, index, uuid, jsonb, primaryKey
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// ---------- Tipos ----------
export const jobStatus = pgEnum('job_status', [
  'SAVED', 'APPLIED', 'INTERVIEWING', 'OFFER', 'REJECTED',
]);
export const roleCategory = pgEnum('role_category', ['manager', 'lead_staff', 'ic']);
export const argentinaFit = pgEnum('argentina_fit', ['yes', 'maybe']);
export const jobSource = pgEnum('job_source', ['yc', 'ashby', 'greenhouse', 'lever', 'manual', 'teamtailor', 'workday', 'oracle', 'workable', 'custom', 'getonbrd']);
export const companyStatus = pgEnum('company_status', ['active', 'inactive']);
export const slugCheckResult = pgEnum('slug_check_result', ['promoted', 'no_latam', 'dead', 'error']);

// --- Auth Tables ---
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  publicId: uuid("public_id").defaultRandom().unique().notNull(),
  email: text("email").notNull().unique(),
  name: text("name"),
  picture: text("picture"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  refreshTokenHash: text("refresh_token_hash").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const allowlist = pgTable("allowlist", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ---------- Empresas ----------
export const companies = pgTable('companies', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull(),
  ats: jobSource('ats').notNull(),
  name: text('name').notNull(),
  hq: text('hq'),
  sector: text('sector'),
  size: integer('size'),
  stage: text('stage'),
  linkedinUrl: text('linkedin_url'),
  linkedinSlug: text('linkedin_slug'),
  employeesAr: integer('employees_ar'),
  linkedinCheckedAt: date('linkedin_checked_at'),
  source: text('source'),
  status: companyStatus('status').notNull().default('active'),
  careersUrl: text('careers_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (t) => ({
  atsSlug: uniqueIndex('companies_ats_slug_key').on(t.ats, sql`lower(${t.slug})`),
  byStatus: index('companies_status_idx').on(t.status),
}));

// ---------- Ofertas ----------
export const jobs = pgTable('jobs', {
  id: serial('id').primaryKey(),
  externalId: text('external_id').notNull(),

  // Puesto
  title: text('title').notNull(),
  description: text('description'),
  applyUrl: text('apply_url').notNull(),
  locations: text('locations'),
  department: text('department'),
  publishedAt: date('published_at'),
  republishedAt: date('republished_at'),
  detectedAt: date('detected_at').notNull().default(sql`CURRENT_DATE`),
  lastSeenAt: date('last_seen_at').notNull().default(sql`CURRENT_DATE`),
  closedAt: date('closed_at'),

  // Clasificación
  priority: smallint('priority').notNull().default(3), // 1 manager, 2 lead/staff, 3 ic
  roleCategory: roleCategory('role_category').notNull().default('ic'),
  acceptsArgentina: argentinaFit('accepts_argentina').notNull(),
  locationMatch: text('location_match'),
  source: jobSource('source').notNull(),

  // Plata
  salary: text('salary'),
  salaryMaxK: integer('salary_max_k'),
  salaryCurrency: char('salary_currency', { length: 3 }).default('USD'),

  // Empresa
  companyId: integer('company_id').references(() => companies.id, { onDelete: 'set null' }),
  company: text('company').notNull(),
  companySlug: text('company_slug'),
  companyHq: text('company_hq'),
  companySize: integer('company_size'),
  companyStage: text('company_stage'),
  companyLinkedin: text('company_linkedin'),
  linkedinPeopleAr: text('linkedin_people_ar'),

  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (t) => ({
  externalIdKey: uniqueIndex('jobs_external_id_key').on(t.externalId),
  byPriority: index('jobs_priority_idx').on(t.priority, t.salaryMaxK),
  byDetected: index('jobs_detected_at_idx').on(t.detectedAt),
  byCompany: index('jobs_company_idx').on(t.companyId),
}));

// ---------- Estado del usuario por aviso ----------
export const userJobs = pgTable('user_jobs', {
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  jobId: integer('job_id').notNull().references(() => jobs.id, { onDelete: 'cascade' }),
  status: jobStatus('status').notNull(),
  notes: text('notes'),
  appliedAt: timestamp('applied_at', { withTimezone: true }),
  expectedSalary: text('expected_salary'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (t) => ({
  pk: primaryKey({ columns: [t.userId, t.jobId] }),
  byUser: index('user_jobs_user_id_idx').on(t.userId),
}));

// ---------- Palabras clave a ignorar ----------
export const ignoredKeywords = pgTable('ignored_keywords', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  keyword: text('keyword').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  userKeyword: uniqueIndex('ignored_keywords_user_keyword_key').on(t.userId, t.keyword),
}));

export const favoriteCompanies = pgTable('favorite_companies', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  companyName: text('company_name').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  userCompany: uniqueIndex('favorite_companies_user_company_key').on(t.userId, sql`lower(${t.companyName})`),
}));

export const userCvs = pgTable("user_cvs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  content: text("content").notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

// ---------- Tracker (Kanban) ----------
export const trackerColumns = pgTable("tracker_columns", {
  id: text("id").primaryKey(), // e.g. "people", "oferta"
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text("title").notNull(),
  badge: text("badge").notNull(),
  wrapperBg: text("wrapper_bg").notNull(),
  cardBg: text("card_bg").notNull(),
  cardHover: text("card_hover").notNull(),
  orderIndex: integer("order_index").notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const trackerJobs = pgTable("tracker_jobs", {
  id: text("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  columnId: text("column_id").notNull().references(() => trackerColumns.id, { onDelete: 'cascade' }),
  
  // Basic info
  name: text("name").notNull(), // Empresa
  role: text("role"),
  location: text("location"),
  
  // Salaries
  salarioMensual: integer("salario_mensual"),
  salarioAnual: integer("salario_anual"),
  monedaSalario: text("moneda_salario").default('USD'),
  
  // Score
  score: smallint("score"),
  
  // Details
  beneficios: text("beneficios"),
  contras: text("contras"),
  inglesRequerido: text("ingles_requerido"),
  handsOn: text("hands_on"),
  idiomaPosicion: text("idioma_posicion"),
  tipoContratacion: text("tipo_contratacion"),
  formaPago: text("forma_pago"),
  plataforma: text("plataforma"),
  
  // Links
  linkPosicion: text("link_posicion"),
  linkEmpresa: text("link_empresa"),
  contactoRecruiter: text("contacto_recruiter"),
  contactoLeader: text("contacto_leader"),
  jd: text("jd"),
  linkNotion: text("link_notion"),
  notionId: text("notion_id"),
  
  // Rejection/Closure
  instanciaCierre: text("instancia_cierre"),
  categoriaCierre: text("categoria_cierre"),
  motivoRechazo: text("motivo_rechazo"),
  closedAt: timestamp('closed_at', { withTimezone: true }),
  customProps: jsonb('custom_props'),
  notes: text('notes'),
  comments: jsonb('comments'),

  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const trackerConfig = pgTable("tracker_config", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  options: jsonb("options").notNull().default('{"instanciaCierre": [], "categoriaCierre": []}'),
  fieldOrder: jsonb("field_order"),
  customProperties: jsonb("custom_properties"),
});

export type Job = typeof jobs.$inferSelect;
export type NewJob = typeof jobs.$inferInsert;
export type UserJob = typeof userJobs.$inferSelect;
export type NewUserJob = typeof userJobs.$inferInsert;

/** Job row joined with per-user state (status, notes, etc.). */
export type JobWithUserState = Job & {
  userStatus: UserJob['status'] | null;
  userNotes: UserJob['notes'] | null;
  userAppliedAt: UserJob['appliedAt'] | null;
  userExpectedSalary: UserJob['expectedSalary'] | null;
};

export type Company = typeof companies.$inferSelect;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type Allowlist = typeof allowlist.$inferSelect;
export type NewAllowlist = typeof allowlist.$inferInsert;
export type IgnoredKeyword = typeof ignoredKeywords.$inferSelect;
export type NewIgnoredKeyword = typeof ignoredKeywords.$inferInsert;
export type FavoriteCompany = typeof favoriteCompanies.$inferSelect;
export type NewFavoriteCompany = typeof favoriteCompanies.$inferInsert;
export type UserCv = typeof userCvs.$inferSelect;
export type NewUserCv = typeof userCvs.$inferInsert;
export type TrackerColumn = typeof trackerColumns.$inferSelect;
export type TrackerJobDb = typeof trackerJobs.$inferSelect;
export type TrackerConfigDb = typeof trackerConfig.$inferSelect;

export const discoveredSlugs = pgTable('discovered_slugs', {
  id: serial('id').primaryKey(),
  ats: jobSource('ats').notNull(),
  slug: text('slug').notNull(),
  source: text('source').notNull(), // 'commoncrawl' | 'probing' | 'manual'
  discoveredAt: timestamp('discovered_at', { withTimezone: true }).notNull().defaultNow(),
  checkedAt: timestamp('checked_at', { withTimezone: true }),
  result: slugCheckResult('result'),
  jobsFound: integer('jobs_found'),
  latamJobs: integer('latam_jobs'),
  companyId: integer('company_id').references(() => companies.id, { onDelete: 'set null' }),
  attempts: smallint('attempts').notNull().default(0),
  lastError: text('last_error'),
}, (t) => ({
  atsSlug: uniqueIndex('discovered_slugs_ats_slug_key').on(t.ats, t.slug),
  pendingQueue: index('discovered_slugs_pending_idx').on(t.discoveredAt).where(sql`${t.checkedAt} IS NULL`),
  byCheckedAt: index('discovered_slugs_checked_at_idx').on(t.checkedAt),
}));
export type DiscoveredSlug = typeof discoveredSlugs.$inferSelect;
export type NewDiscoveredSlug = typeof discoveredSlugs.$inferInsert;
