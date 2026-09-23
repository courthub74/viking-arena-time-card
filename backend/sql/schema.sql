CREATE TABLE IF NOT EXISTS users (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  first_name varchar(50) NOT NULL,
  last_name varchar(50) NOT NULL,
  role varchar(20) NOT NULL,
  job_title varchar(50) NOT NULL,
  pin_hash text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),

  CONSTRAINT users_role_check
    CHECK (role IN ('employee', 'manager')),

  CONSTRAINT users_job_title_check
    CHECK (
      job_title IN (
        'employee',
        'manager',
        'zamboni_driver',
        'skate_instructor',
        'skate_guard'
      )
    )
);