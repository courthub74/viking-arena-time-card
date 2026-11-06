BEGIN;

CREATE TABLE public.manager_invitations (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  token_hash text NOT NULL UNIQUE,
  created_by integer NOT NULL REFERENCES public.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  used_by integer REFERENCES public.users(id),
  revoked_at timestamptz,

  CONSTRAINT manager_invitations_expiry_check
    CHECK (expires_at > created_at),

  CONSTRAINT manager_invitations_usage_check
    CHECK (
      (used_at IS NULL AND used_by IS NULL)
      OR
      (used_at IS NOT NULL AND used_by IS NOT NULL)
    )
);

COMMIT;