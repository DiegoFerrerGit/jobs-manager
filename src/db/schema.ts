import {
  pgTable,
  serial,
  text,
  boolean,
  integer,
  timestamp,
  pgEnum,
  uuid,
} from "drizzle-orm/pg-core";

export const applicationStatusEnum = pgEnum("application_status", [
  "SAVED",
  "APPLIED",
  "INTERVIEWING",
  "OFFER",
  "REJECTED"
]);

export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  
  externalId: text("external_id"),
  titulo: text("titulo").notNull(),
  empresa: text("empresa").notNull(),
  empleados: text("empleados"),
  salario: text("salario"),
  ubicaciones: text("ubicaciones"),
  motivo: text("motivo"),
  visa: text("visa"),
  fecha_publicacion: text("fecha_publicacion"),
  fecha_detectada: text("fecha_detectada"),
  url_aplicar: text("url_aplicar"),
  prioridad: text("prioridad"),
  acepta_argentina: text("acepta_argentina"),
  linkedin_empresa: text("linkedin_empresa"),
  
  description: text("description"),
  status: applicationStatusEnum("status").default("SAVED").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

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

export type Job = typeof jobs.$inferSelect;
export type NewJob = typeof jobs.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type Allowlist = typeof allowlist.$inferSelect;
export type NewAllowlist = typeof allowlist.$inferInsert;
