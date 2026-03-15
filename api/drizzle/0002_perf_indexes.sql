DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public' AND indexname = 'user_role_idx'
  ) THEN
    CREATE INDEX user_role_idx ON "user" (role);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public' AND indexname = 'user_email_idx'
  ) THEN
    CREATE INDEX user_email_idx ON "user" (email);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public' AND indexname = 'user_created_at_idx'
  ) THEN
    CREATE INDEX user_created_at_idx ON "user" (created_at);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public' AND indexname = 'departments_name_idx'
  ) THEN
    CREATE INDEX departments_name_idx ON departments (name);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public' AND indexname = 'departments_code_idx'
  ) THEN
    CREATE INDEX departments_code_idx ON departments (code);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public' AND indexname = 'departments_created_at_idx'
  ) THEN
    CREATE INDEX departments_created_at_idx ON departments (created_at);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public' AND indexname = 'subjects_name_idx'
  ) THEN
    CREATE INDEX subjects_name_idx ON subjects (name);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public' AND indexname = 'subjects_code_idx'
  ) THEN
    CREATE INDEX subjects_code_idx ON subjects (code);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public' AND indexname = 'subjects_department_id_idx'
  ) THEN
    CREATE INDEX subjects_department_id_idx ON subjects (department_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public' AND indexname = 'subjects_created_at_idx'
  ) THEN
    CREATE INDEX subjects_created_at_idx ON subjects (created_at);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public' AND indexname = 'classes_created_at_idx'
  ) THEN
    CREATE INDEX classes_created_at_idx ON classes (created_at);
  END IF;
END $$;
