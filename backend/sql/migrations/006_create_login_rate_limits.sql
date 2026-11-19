BEGIN;

CREATE TABLE public.login_rate_limits (
  limiter_name TEXT NOT NULL,
  client_key TEXT NOT NULL,
  total_hits INTEGER NOT NULL DEFAULT 0,
  reset_at TIMESTAMPTZ NOT NULL,

  PRIMARY KEY (limiter_name, client_key),

  CONSTRAINT login_rate_limits_hits_check
    CHECK (total_hits >= 0)
);

CREATE INDEX login_rate_limits_reset_at_idx
  ON public.login_rate_limits (reset_at);

COMMIT;