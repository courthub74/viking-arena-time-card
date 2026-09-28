BEGIN;

CREATE TABLE time_entries (
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

CREATE INDEX time_entries_user_clock_in_idx
  ON time_entries (user_id, clock_in);

COMMIT;