# Local recovery after the Codex changes

The repository was repaired from the last known-good committed application state and the recent risky working-tree changes were not blindly preserved.

## Safe recovery sequence

1. Keep the production Neon/Render database untouched.
2. Create a separate development PostgreSQL database or Neon development branch.
3. Put that development connection string in the local `.env` as `DATABASE_URL`.
4. Keep `JWT_SECRET` set to a development-only secret.
5. Run `npm run db:migrate`.
6. If the development database is empty, load the base `database/schema.sql` first, then run `npm run db:migrate`.
7. Start with `npm run dev`.
8. Check `/api/health` and `/api/health/ready`.
9. Test registration, login, catalogue, cart, addresses, checkout, orders, admin, wishlist, profile and tracking.

Do not copy a production database URL into local development unless you have deliberately created a safe isolated branch/database and accepted the risk.
