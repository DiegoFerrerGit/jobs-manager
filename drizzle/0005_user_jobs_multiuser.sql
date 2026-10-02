BEGIN;

-- 1. Tabla temporal con el id que conservamos por cada external_id
CREATE TEMP TABLE keep AS
SELECT external_id, min(id) AS keep_id FROM jobs GROUP BY external_id;

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

-- 3. Migrar datos de usuario a user_jobs
INSERT INTO user_jobs (user_id, job_id, status, notes, applied_at,
                       expected_salary, created_at, updated_at)
SELECT j.user_id, k.keep_id, j.status, j.notes, j.applied_at,
       j.expected_salary, j.created_at, j.updated_at
FROM jobs j
JOIN keep k ON k.external_id = j.external_id
ON CONFLICT (user_id, job_id) DO NOTHING;

-- 4. Eliminar filas duplicadas por external_id (conservar la de menor id)
DELETE FROM jobs j USING keep k
WHERE j.external_id = k.external_id AND j.id <> k.keep_id;

-- 5. Quitar columnas de usuario de jobs
ALTER TABLE jobs
  DROP COLUMN user_id,
  DROP COLUMN status,
  DROP COLUMN notes,
  DROP COLUMN applied_at,
  DROP COLUMN expected_salary;

-- 6. Reemplazar indice unico viejo por uno en external_id solo
DROP INDEX IF EXISTS jobs_user_external_key;
DROP INDEX IF EXISTS jobs_user_company_title_key;
DROP INDEX IF EXISTS jobs_user_status_idx;
DROP INDEX IF EXISTS jobs_user_priority_idx;
DROP INDEX IF EXISTS jobs_detected_idx;

CREATE UNIQUE INDEX jobs_external_id_key ON jobs (external_id);
CREATE INDEX jobs_priority_idx ON jobs (priority, salary_max_k);
CREATE INDEX jobs_detected_at_idx ON jobs (detected_at);

-- 7. Indices para user_jobs
CREATE INDEX user_jobs_user_id_idx ON user_jobs (user_id);

COMMIT;
