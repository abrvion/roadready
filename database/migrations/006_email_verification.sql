ALTER TABLE users
  ADD COLUMN IF NOT EXISTS email_verified boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS email_verification_token text,
  ADD COLUMN IF NOT EXISTS email_verification_expires timestamp without time zone;

CREATE INDEX IF NOT EXISTS users_email_verification_token_idx
  ON users(email_verification_token)
  WHERE email_verification_token IS NOT NULL;
