// Uso: node --env-file=.env.local scripts/split-ghosting.mjs  (o .env.production)
import pg from "pg";
const OLD = "Ghosting/Sin respuesta";
const GH = { label: "Ghosting", color: "bg-[#9d6333] text-white/95" };
const SF = { label: "Sin feedback", color: "bg-[#8c4669] text-white/95" };
const c = new pg.Client({ connectionString: process.env.DATABASE_URL });
await c.connect();
const { rows } = await c.query("select id, options from tracker_config");
for (const r of rows) {
  const opts = r.options || {};
  const list = Array.isArray(opts.categoriaCierre) ? opts.categoriaCierre : [];
  if (!list.some(o => o.label === OLD)) continue;
  const out = [];
  for (const o of list) {
    if (o.label === OLD) {
      out.push({ ...o, label: GH.label });
      if (!list.some(x => x.label === SF.label)) out.push(SF);
    } else out.push(o);
  }
  await c.query("update tracker_config set options = $1 where id = $2", [{ ...opts, categoriaCierre: out }, r.id]);
  console.log("config actualizada", r.id);
}
const j = await c.query("update tracker_jobs set categoria_cierre = $1 where categoria_cierre = $2", [GH.label, OLD]);
console.log("jobs actualizados:", j.rowCount);
await c.end();
