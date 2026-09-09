# RoadReady

RoadReady is a multi-page motorcycle parts and accessories ecommerce application built with vanilla HTML/CSS/JavaScript, Node.js/Express and PostgreSQL.

## Stack

- Frontend: HTML, CSS, Bootstrap, vanilla JavaScript modules
- Backend: Node.js + Express
- Database: PostgreSQL (`pg`)
- Authentication: JWT + bcryptjs
- Deployment target: Render + managed PostgreSQL (for example Neon)

## Local setup

1. Install Node.js 20+.
2. Copy `.env.example` to `.env`.
3. Set a development PostgreSQL `DATABASE_URL`. **Use a disposable development database, never the production database.**
4. Set a long random `JWT_SECRET`.
5. Install dependencies with `npm install`.
6. Create the base schema with `database/schema.sql` on a fresh database, or run `npm run db:migrate` against an existing RoadReady database.
7. Start with `npm run dev`.
8. Verify `http://localhost:5000/api/health` and `/api/health/ready`.

## Database safety

The application never needs production database access during local development. Keep production credentials only in the deployment platform's secret environment settings. Before applying a migration to production, take a database backup and review the SQL.

## Scripts

- `npm start` — production server
- `npm run dev` — local development server
- `npm test` — automated regression tests that do not require a database
- `npm run db:migrate` — apply numbered PostgreSQL migrations to the configured database
- `npm run db:check` — verify the configured database connection

## Production environment

Required:

- `NODE_ENV=production`
- `DATABASE_URL`
- `JWT_SECRET`
- `APP_URL`

Optional password-reset email delivery using Resend:

- `RESEND_API_KEY`
- `EMAIL_FROM`

Do not commit `.env`, credentials, JWT secrets, database URLs containing passwords, or provider API keys.

## Current commerce behavior

- Public catalogue and product detail pages
- Customer registration/login and JWT authentication
- Customer profile and saved addresses
- Cart with stock validation
- Transactional checkout and Cash on Delivery
- Order history, order details and public order tracking
- Admin catalogue, customers and order status management
- Wishlist
- Newsletter subscription storage
- Password reset with hashed one-time tokens and optional Resend delivery

Payment gateway integration, product reviews and bike-specific compatibility data are deliberately not presented as active functionality until their required business/data models and provider credentials exist.


### Authentication session
Browser authentication uses a SameSite=Lax, HttpOnly `roadready_token` cookie. The bearer token remains in localStorage only for compatibility with existing client modules.
