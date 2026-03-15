DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname = 'enrollments_student_class_unique'
  ) THEN
    CREATE UNIQUE INDEX enrollments_student_class_unique
      ON enrollments (student_id, class_id);
  END IF;
END $$;
