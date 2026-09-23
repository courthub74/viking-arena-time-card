-- Migration: Add job_title column to users table
ALTER TABLE users
ADD COLUMN job_title varchar(50);

UPDATE users
SET job_title = CASE
  WHEN role = 'manager' THEN 'manager'
  ELSE 'employee'
END;

ALTER TABLE users
ALTER COLUMN job_title SET NOT NULL;

ALTER TABLE users
ADD CONSTRAINT users_job_title_check
CHECK (
  job_title IN (
    'employee',
    'manager',
    'zamboni_driver',
    'skate_instructor',
    'skate_guard'
  )
);