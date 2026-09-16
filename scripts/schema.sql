-- Schéma Carnet Scolaire CI — à exécuter une fois sur la base Supabase/Postgres.
-- Idempotent (IF NOT EXISTS) : peut être relancé sans danger.

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'STUDENT',
  status TEXT NOT NULL DEFAULT 'PENDING',
  class_level TEXT,
  series TEXT,
  school TEXT,
  created_at TEXT NOT NULL,
  approved_at TEXT,
  approved_by_id TEXT,
  rejected_reason TEXT
);

CREATE TABLE IF NOT EXISTS subjects (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  coefficient INTEGER NOT NULL DEFAULT 1,
  trimester INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_subjects_user_trimester ON subjects(user_id, trimester);

CREATE TABLE IF NOT EXISTS grades (
  id TEXT PRIMARY KEY,
  subject_id TEXT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  value DOUBLE PRECISION NOT NULL,
  scale INTEGER NOT NULL DEFAULT 20,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_grades_subject ON grades(subject_id);

CREATE TABLE IF NOT EXISTS conducts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  trimester INTEGER NOT NULL,
  value DOUBLE PRECISION NOT NULL DEFAULT 18,
  updated_at TEXT NOT NULL,
  UNIQUE (user_id, trimester)
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  used_at TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_reset_token_hash ON password_reset_tokens(token_hash);
