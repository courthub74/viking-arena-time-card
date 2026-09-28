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

CREATE TABLE IF NOT EXISTS time_entries (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id integer NOT NULL
    REFERENCES users(id),
  clock_in timestamp with time zone NOT NULL,
  clock_out timestamp with time zone NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),

  CONSTRAINT time_entries_clock_order_check
    CHECK (clock_out > clock_in),

  CONSTRAINT time_entries_duration_check
    CHECK (clock_out - clock_in <= interval '24 hours')
);

CREATE INDEX IF NOT EXISTS time_entries_user_clock_in_idx
  ON time_entries (user_id, clock_in);