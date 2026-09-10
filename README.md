# RoadReady 🏍️

**RoadReady** is a full-stack e-commerce platform for motorcycle parts and accessories, built with a focus on real-world shopping workflows, database-driven functionality, and a responsive user experience.

The platform provides customers with product browsing, accounts, shopping cart, checkout, orders, reviews, wishlists, and order tracking, alongside a dedicated administrative dashboard for managing the store.

## ✨ Features

### Customer Experience

* Product catalogue and category browsing
* Product details and availability
* Customer registration and authentication
* Shopping cart
* Checkout
* Cash on Delivery
* Order history and order details
* Order tracking
* Address management
* Wishlist
* Product reviews and ratings
* Motorcycle compatibility features
* Responsive design

### Administration

* Admin dashboard
* Product management
* Category management
* Customer management
* Order management
* Order status updates
* Motorcycle compatibility management

## 🧰 Tech Stack

**Frontend**

* HTML5
* CSS3
* Bootstrap
* Vanilla JavaScript

**Backend**

* Node.js
* Express.js
* REST API

**Database**

* PostgreSQL
* Neon

**Testing**

* Node.js Test Runner

**Deployment**

* GitHub
* Render


## 🚀 Getting Started

Follow these steps to run RoadReady locally.

### 1. Clone the Repository

```bash
git clone https://github.com/abrvion/roadready.git
```

Navigate into the project:

```bash
cd roadready
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root using `.env.example` as a reference.

Example:

```env
NODE_ENV=development
PORT=5000
DATABASE_URL=your_local_database_url
JWT_SECRET=your_secret
APP_URL=http://localhost:5000
```

> Never commit your `.env` file or expose database credentials, API keys, or other secrets.

### 4. Set Up the Database

Make sure you have a PostgreSQL database available for local development.

For a new database, use the schema provided in:

```text
database/schema.sql
```

For an existing RoadReady database, run:

```bash
npm run db:migrate
```

You can verify the database connection with:

```bash
npm run db:check
```

### 5. Start the Application

Development mode:

```bash
npm run dev
```

Or start normally:

```bash
npm start
```

The application will be available at:

```text
http://localhost:5000
```

## 🧪 Testing

Run the automated test suite with:

```bash
npm test
```

The test suite covers core backend functionality, database integrity, authentication-related behavior, and regression checks.

## 📜 Available Scripts

| Command              | Description                       |
| -------------------- | --------------------------------- |
| `npm start`          | Start the production server       |
| `npm run dev`        | Start the development server      |
| `npm test`           | Run automated tests               |
| `npm run db:migrate` | Apply pending database migrations |
| `npm run db:check`   | Check database connectivity       |

## 🌐 Deployment

RoadReady is deployed using:

* **GitHub** for source control
* **Render** for application hosting
* **Neon** for PostgreSQL

The production application uses environment variables configured through the hosting platform.

## 📌 Project Status

**Active Development**

RoadReady's core e-commerce functionality and administrative system are implemented and deployed.

The project continues to evolve with improvements to production reliability, security, performance, user experience, and additional e-commerce functionality.

## 📚 Documentation

Additional project documentation is available in the `docs/` directory, including:

* Architecture
* API documentation
* Database planning
* Business rules
* Deployment
* Design system
* Project planning
* Verification

## 👨‍💻 Author

**ABR / Ibrahim**

RoadReady is a self-directed full-stack development project built to gain practical experience designing, developing, testing, and deploying a real-world e-commerce application.

## 📄 License

This project is currently intended for personal and portfolio use.
