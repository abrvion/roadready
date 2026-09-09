# RoadReady Deployment Runbook

## Before deployment

1. Run `npm ci`.
2. Run `npm test`.
3. Configure production `DATABASE_URL`, `JWT_SECRET`, `APP_URL` and `NODE_ENV=production` in the hosting provider's secret environment settings.
4. Take a PostgreSQL backup before any schema change.
5. Run `npm run db:migrate` against the intended production database during a controlled maintenance window.
6. Verify `/api/health` and `/api/health/ready`.
7. Test registration/login, catalogue, cart, checkout, order status and admin access with disposable accounts.
8. Confirm no secrets appear in source, logs or client responses.

## Render

Use the existing Node service with build command `npm ci` and start command `npm start`. Render supplies `PORT`; do not hard-code a production port. Set the secret environment variables in the Render dashboard rather than committing them.

## Database

Never point local development at production. Create a separate development database/branch. Apply migrations in filename order. The migration runner records applied filenames in `schema_migrations` and skips them on later runs.

## Password reset

Production password reset requires `RESEND_API_KEY` and `EMAIL_FROM` configured for a verified sender. Without those values, the endpoint intentionally fails rather than exposing reset tokens or pretending an email was delivered.
