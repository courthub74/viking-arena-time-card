BEGIN;

CREATE TABLE scheduled_shifts (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

  schedule_date date NOT NULL,
  slot varchar(30) NOT NULL,
  user_id integer NOT NULL REFERENCES users(id),

  start_time time NOT NULL,
  end_time time,
  ends_at_close boolean NOT NULL DEFAULT false,

  created_by integer NOT NULL REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT scheduled_shifts_slot_check
    CHECK (
      slot IN (
        'driver_one_am',
        'driver_two_am',
        'driver_one_pm',
        'driver_two_pm',
        'skate_guard_one',
        'skate_guard_two'
      )
    ),

  CONSTRAINT scheduled_shifts_end_check
    CHECK (
      (ends_at_close AND end_time IS NULL)
      OR
      (NOT ends_at_close AND end_time IS NOT NULL)
    ),

  CONSTRAINT scheduled_shifts_time_check
    CHECK (end_time IS NULL OR end_time <> start_time),

  CONSTRAINT scheduled_shifts_date_slot_unique
    UNIQUE (schedule_date, slot)
);

CREATE INDEX scheduled_shifts_user_date_idx
  ON scheduled_shifts (user_id, schedule_date);

COMMIT;