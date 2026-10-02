BEGIN;

-- 1. Mapeo: cada fila apunta a la fila que se conserva de su external_id
CREATE TEMP TABLE keep AS
SELECT id,
       first_value(id) OVER (
         PARTITION BY coalesce(external_id::text, 'null:' || id::text)
         ORDER BY id
       ) AS keep_id
FROM jobs;

CREATE INDEX ON keep (id);

-- 2. Crear tabla user_jobs
CREATE TABLE user_jobs (
  user_id         integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id          integer NOT NULL REFERENCES jobs(id)  ON DELETE CASCADE,
  status          job_status NOT NULL,
  notes           text,
  applied_at      timestamptz,
  expected_salary text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, job_id)
);

-- 3. Migrar el estado de usuario.
--    Si hay duplicados, gana la fila con estado real, no una al azar.
INSERT INTO user_jobs (user_id, job_id, status, notes, applied_at,
                       expected_salary, created_at, updated_at)
SELECT DISTINCT ON (j.user_id, k.keep_id)
       j.user_id, k.keep_id, j.status, j.notes, j.applied_at,
       j.expected_salary, j.created_at, j.updated_at
FROM jobs j
JOIN keep k ON k.id = j.id
WHERE j.user_id IS NOT NULL
ORDER BY j.user_id, k.keep_id,
         (j.applied_at IS NOT NULL) DESC,
         (j.notes IS NOT NULL AND j.notes <> '') DESC,
         (j.expected_salary IS NOT NULL) DESC,
         j.updated_at DESC NULLS LAST,
         j.id;

-- 4. Borrar las filas duplicadas por external_id
DELETE FROM jobs j USING keep k
WHERE k.id = j.id AND j.id <> k.keep_id;

-- 5. Quitar las columnas de usuario de jobs.
--    Esto borra solo los cinco indices viejos, porque todos contienen user_id.
ALTER TABLE jobs
  DROP COLUMN user_id,
  DROP COLUMN status,
  DROP COLUMN notes,
  DROP COLUMN applied_at,
  DROP COLUMN expected_salary;

-- 6. Indices de jobs, equivalentes a los viejos sin user_id
CREATE UNIQUE INDEX jobs_external_id_key   ON jobs (external_id);
CREATE UNIQUE INDEX jobs_company_title_key ON jobs (lower(company), lower(title));
CREATE INDEX        jobs_priority_idx      ON jobs (priority, salary_max_k);
CREATE INDEX        jobs_detected_at_idx   ON jobs (detected_at);

-- 7. Indices de user_jobs
CREATE INDEX user_jobs_job_id_idx      ON user_jobs (job_id);
CREATE INDEX user_jobs_user_status_idx ON user_jobs (user_id, status);

COMMIT;

