# 💰 Financial Resource Management System for Social Welfare

A full-stack web application that manages financial resources for social welfare organizations — enabling transparent donation tracking, priority-based fund allocation, and beneficiary assistance applications.

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Complete Folder Structure](#complete-folder-structure)
3. [Technologies Used & Why](#technologies-used--why)
4. [Database Connection — How It Works](#database-connection--how-it-works)
5. [Database Schema — Tables & Relationships](#database-schema--tables--relationships)
6. [Backend File-by-File Explanation](#backend-file-by-file-explanation)
   - [server.js — Application Entry Point](#serverjs--application-entry-point)
   - [config/db.js — Database Pool](#configdbjs--database-pool)
   - [middleware/auth.js — Authentication Guard](#middlewareauthjs--authentication-guard)
   - [routes/ — URL Routing Layer](#routes--url-routing-layer)
   - [controllers/ — Business Logic Layer](#controllers--business-logic-layer)
   - [init.js — Database Seeder](#initjs--database-seeder)
7. [Frontend File-by-File Explanation](#frontend-file-by-file-explanation)
8. [All API Endpoints (with Examples)](#all-api-endpoints-with-examples)
9. [Priority Scoring Algorithm](#priority-scoring-algorithm)
10. [Security Implementation](#security-implementation)
11. [Request–Response Flow (End to End)](#requestresponse-flow-end-to-end)
12. [Quick Start Guide](#quick-start-guide)
13. [Demo Credentials](#demo-credentials)

---

## Project Overview

This system has **three types of users**:

| Role | What They Do |
|------|-------------|
| **Admin** | Oversees everything — reviews applications, approves/rejects fund requests, monitors all donations and users |
| **Donor** | Contributes money to the welfare fund with an optional message, views their donation history |
| **Beneficiary** | People in need — submit applications for financial assistance, upload supporting documents, track their application status |

**Core idea:** Donors put money in → Beneficiaries apply for help → Admin reviews and allocates money fairly using an automatic priority scoring system.

---

## Complete Folder Structure

```
financial_resourse_managment_for_social-_wlefare/
│
├── README.md                    ← You are reading this file
├── .gitignore                   ← Files Git should ignore (node_modules, .env, uploads/)
│
├── database/
│   └── schema.sql               ← SQL script: creates all tables + inserts demo data
│
├── backend/                     ← Node.js server (all server-side code lives here)
│   ├── server.js                ← MAIN ENTRY POINT — starts Express, registers all routes
│   ├── package.json             ← Lists all npm dependencies + run scripts
│   ├── .env.example             ← Template for environment variables (copy to .env)
│   ├── init.js                  ← One-time database setup & demo data seeding script
│   │
│   ├── config/
│   │   └── db.js                ← Creates & exports the MySQL connection pool
│   │
│   ├── middleware/
│   │   └── auth.js              ← JWT token verification + role-based access control
│   │
│   ├── routes/                  ← Define which URL paths exist and who can access them
│   │   ├── auth.js              ← /api/auth/register and /api/auth/login (public)
│   │   ├── donations.js         ← /api/donations/* (donors only)
│   │   ├── applications.js      ← /api/applications/* (beneficiaries + admins)
│   │   └── admin.js             ← /api/admin/* (admins only)
│   │
│   └── controllers/             ← Actual business logic (what happens when a route is hit)
│       ├── authController.js    ← register() and login() functions
│       ├── donationController.js← addDonation(), getMyDonations(), getTotalFunds()
│       ├── applicationController.js ← applyForFunds(), getMyApplications(), getApplicationDetails()
│       └── adminController.js   ← getDashboardStats(), getAllApplications(), approveApplication(),
│                                    rejectApplication(), getAllDonations(), getAllUsers()
│
├── frontend/                    ← All browser-side files (HTML, CSS, JavaScript)
│   ├── index.html               ← Login / Register page (the first page users see)
│   ├── login.html               ← Alternative login entry point
│   ├── admin.html               ← Admin dashboard UI
│   ├── donor.html               ← Donor dashboard UI
│   ├── beneficiary.html         ← Beneficiary dashboard UI
│   │
│   ├── css/
│   │   ├── style.css            ← Main stylesheet for all pages
│   │   └── landing.css          ← Styles specific to the landing/login page
│   │
│   └── js/
│       ├── auth.js              ← Login & registration form logic, JWT storage, role redirect
│       ├── admin.js             ← Admin dashboard: load stats, applications, approve/reject
│       ├── donor.js             ← Donor dashboard: submit donations, view history & stats
│       └── beneficiary.js       ← Beneficiary dashboard: submit applications, track status
│
└── uploads/                     ← Created automatically — stores uploaded documents
```

---

## Technologies Used & Why

### Backend

| Package | Version | What It Does | Why This Was Chosen |
|---------|---------|--------------|---------------------|
| **Node.js** | ≥ 16 | JavaScript runtime — executes server code | Non-blocking I/O makes it efficient for API servers that handle many concurrent requests |
| **Express.js** | ^4.18.2 | Web framework — handles HTTP routing and middleware | The most popular Node.js framework; minimal, flexible, huge ecosystem, easy to learn |
| **mysql2** | ^3.2.0 | MySQL database driver | The `mysql2/promise` variant gives native async/await support and connection pooling |
| **bcryptjs** | ^2.4.3 | Password hashing | bcrypt is a one-way slow hash specifically designed for passwords; cannot be reversed |
| **jsonwebtoken** | ^9.0.0 | Creates and verifies JWT tokens | Industry-standard stateless authentication — no server-side session storage needed |
| **dotenv** | ^16.0.3 | Loads `.env` file into `process.env` | Keeps secrets (DB passwords, JWT keys) out of source code |
| **cors** | ^2.8.5 | Adds CORS headers to responses | Allows the frontend (potentially on a different port) to call the API without browser errors |
| **multer** | ^2.1.1 | Handles `multipart/form-data` (file uploads) | Standard Express middleware for processing file uploads; stores files to disk safely |
| **express-rate-limit** | ^8.3.1 | Throttles requests per IP | Prevents brute-force login attacks and API abuse |
| **nodemon** | ^3.1.14 | Auto-restarts server on file changes | Development quality-of-life — no need to manually restart after every edit |

### Database

| Technology | Why |
|-----------|-----|
| **MySQL 8** | Relational database — chosen because the data has clear relationships (users → donations, users → applications → transactions). Foreign keys ensure data integrity. |

### Frontend

| Technology | Why |
|-----------|-----|
| **Vanilla HTML5/CSS3/JS** | No framework dependency. The application is small enough that React/Vue would add unnecessary complexity. Pure JS keeps the bundle size near zero. |
| **Google Fonts (Poppins)** | A clean, modern font that improves readability for a welfare management dashboard. |

---

## Database Connection — How It Works

### Step 1 — Environment Variables

Before connecting, the backend needs to know the database credentials. These are stored in a `.env` file (never committed to Git):

```
DB_HOST=localhost      ← IP address or hostname of MySQL server
DB_USER=root          ← MySQL username
DB_PASSWORD=          ← MySQL password (empty for local dev)
DB_NAME=financial_welfare  ← Name of the database to use
JWT_SECRET=your_secret     ← Secret key used to sign JWT tokens
PORT=3000                  ← Port the Express server listens on
```

### Step 2 — Connection Pool (`backend/config/db.js`)

```javascript
const mysql = require('mysql2/promise');  // Promise-based MySQL driver

const pool = mysql.createPool({
  host:             process.env.DB_HOST || 'localhost',
  user:             process.env.DB_USER || 'root',
  password:         process.env.DB_PASSWORD || '',
  database:         process.env.DB_NAME || 'financial_welfare',
  waitForConnections: true,   // Queue requests instead of failing when all connections are busy
  connectionLimit:  10,        // Maximum 10 simultaneous connections
  queueLimit:       0          // Unlimited queuing of requests
});

module.exports = pool;  // Export so any controller can import and use it
```

**What is a connection pool?**
Instead of opening and closing a database connection for every single HTTP request (expensive), a pool keeps 10 connections open and reuses them. When a request needs the database, it borrows a connection from the pool; when done, it returns it.

### Step 3 — Using the Pool in Controllers

```javascript
// Simple query — pool automatically picks a free connection
const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

// Transaction — must use the same connection for all steps
const connection = await pool.getConnection();
await connection.beginTransaction();
try {
  await connection.query('UPDATE applications SET status = "approved" WHERE id = ?', [id]);
  await connection.query('INSERT INTO transactions ...', [...]);
  await connection.commit();    // Both queries succeed → save changes
} catch (err) {
  await connection.rollback();  // Either fails → undo all changes
} finally {
  connection.release();         // Return connection back to the pool
}
```

### Step 4 — Startup Verification

In `server.js`, after the server starts listening, it immediately tries a test query:

```javascript
try {
  await db.query('SELECT 1');
  console.log('✅ Database connection OK');
} catch (err) {
  console.error('❌ Database connection FAILED:', err.message);
}
```

This way, any misconfiguration is caught immediately at startup rather than silently failing on the first real request.

---

## Database Schema — Tables & Relationships

```
users
 ├── id (PK)
 ├── name, email, password (bcrypt hash), role (admin/donor/beneficiary)
 └── created_at

donations
 ├── id (PK)
 ├── donor_id → users.id (FK)   ← which donor made this donation
 ├── amount, message
 └── created_at

applications
 ├── id (PK)
 ├── beneficiary_id → users.id (FK)   ← who applied
 ├── reviewed_by   → users.id (FK)    ← which admin reviewed it
 ├── phone, address, income, family_members, employment_status
 ├── amount (requested), category, reason, urgency
 ├── documents_path (JSON array of file paths)
 ├── priority_score (0–100), priority_level (Low/Medium/High)
 ├── status (pending/approved/rejected)
 ├── amount_allocated, reviewed_at
 └── created_at

transactions
 ├── id (PK)
 ├── application_id → applications.id (FK)
 ├── beneficiary_id → users.id (FK)
 ├── amount, type (allocation)
 └── created_at
```

**How available funds are calculated:**
```
available_funds = SUM(donations.amount) − SUM(transactions.amount WHERE type='allocation')
```

---

## Backend File-by-File Explanation

### `server.js` — Application Entry Point

This is the **first file that runs** when you start the server (`node server.js`). It does the following in order:

1. **Validate `JWT_SECRET`** — exits in production if missing; auto-generates a random one for development
2. **Create `uploads/` directory** — ensures the folder for uploaded files exists
3. **Configure Multer** — sets up file upload rules (max 5 MB, only PDF/JPEG/PNG/GIF allowed)
4. **Set up rate limiters**
   - Auth routes: max 20 requests per 15 minutes per IP (prevents brute-force)
   - All other API routes: max 200 requests per 15 minutes per IP
5. **Register middleware** — CORS headers, JSON body parsing, static file serving
6. **Register API routes** — connects URL prefixes to route files
7. **Add global error handler** — catches any unhandled errors and returns a clean 500 response
8. **Start listening** on `PORT` (default 3000)
9. **Verify database connection** — runs `SELECT 1` to confirm MySQL is reachable

---

### `config/db.js` — Database Pool

**Purpose:** Creates one shared MySQL connection pool and exports it so every controller can `require('../config/db')` and run queries without managing connections themselves.

**Key function:** `pool.query(sql, params)` — runs a parameterised query using `?` placeholders, which prevents SQL injection.

---

### `middleware/auth.js` — Authentication Guard

Contains two functions that are used as Express middleware (functions that run before the route handler):

#### `authenticate(req, res, next)`
- Reads the `Authorization: Bearer <token>` header
- Verifies the JWT signature using `JWT_SECRET`
- If valid: attaches the decoded user object (`{ id, name, email, role }`) to `req.user` and calls `next()` to continue
- If missing or invalid: responds with `401 Unauthorized` or `403 Forbidden`

#### `authorize(...roles)`
- A **middleware factory** — you call it with the allowed roles and it returns a middleware function
- Usage example: `authorize('admin')` or `authorize('donor', 'admin')`
- Checks `req.user.role` (set by `authenticate`) against the allowed roles
- If the role matches: calls `next()` to continue
- If not allowed: responds with `403 Forbidden`

**Usage pattern in routes:**
```javascript
router.post('/', authenticate, authorize('donor'), addDonation);
// 1. authenticate checks the token
// 2. authorize('donor') checks the role
// 3. addDonation handles the actual logic
```

---

### `routes/` — URL Routing Layer

Route files define **what URLs exist** and **which middleware + controller function handles each one**. They contain no business logic.

#### `routes/auth.js`
```
POST /api/auth/register  →  authController.register
POST /api/auth/login     →  authController.login
```
No authentication required (public endpoints).

#### `routes/donations.js`
```
POST /api/donations        →  authenticate → authorize('donor') → addDonation
GET  /api/donations/my     →  authenticate → authorize('donor') → getMyDonations
GET  /api/donations/total  →  authenticate                      → getTotalFunds
```

#### `routes/applications.js`
```
POST /api/applications     →  authenticate → authorize('beneficiary') → multer → applyForFunds
GET  /api/applications/my  →  authenticate → authorize('beneficiary') → getMyApplications
GET  /api/applications/:id →  authenticate                            → getApplicationDetails
```
The POST route uses Multer inline to handle `multipart/form-data` (file upload + form fields).

#### `routes/admin.js`
All routes apply `authenticate + authorize('admin')` at the router level, so every endpoint in this file requires an admin token.

```
GET /api/admin/stats                       →  getDashboardStats
GET /api/admin/applications                →  getAllApplications
PUT /api/admin/applications/:id/approve   →  approveApplication
PUT /api/admin/applications/:id/reject    →  rejectApplication
GET /api/admin/donations                   →  getAllDonations
GET /api/admin/users                       →  getAllUsers
```

---

### `controllers/` — Business Logic Layer

Controllers contain the **actual code** that runs when a route is matched.

#### `authController.js`

##### `register(req, res)`
1. Validates that `name`, `email`, `password`, `role` are all present
2. Checks that `role` is either `'donor'` or `'beneficiary'` (admins cannot self-register)
3. Queries the database to check if the email is already taken
4. Hashes the password with `bcrypt.hash(password, 10)` (10 = work factor/salt rounds)
5. Inserts the new user row
6. Returns `201 Created` with the new `userId`

##### `login(req, res)`
1. Validates `email` and `password` are provided
2. Looks up the user by email
3. Uses `bcrypt.compare(plaintext, hash)` to verify the password
4. If valid, creates a JWT: `jwt.sign({ id, name, email, role }, JWT_SECRET, { expiresIn: '24h' })`
5. Returns the token and basic user info

---

#### `donationController.js`

##### `addDonation(req, res)`
- Validates `amount > 0`
- Inserts a row into `donations` with `donor_id = req.user.id` (from the JWT)
- Returns `201 Created` with the new `donationId`

##### `getMyDonations(req, res)`
- Queries all donations WHERE `donor_id = req.user.id`
- Returns them ordered newest-first

##### `getTotalFunds(req, res)`
- Sums all donations: `SELECT SUM(amount) FROM donations`
- Sums all allocations: `SELECT SUM(amount) FROM transactions WHERE type = 'allocation'`
- Returns `{ total_donated, total_allocated, available_funds }`

---

#### `applicationController.js`

##### `calculatePriorityScore({ income, family_members, urgency, hasDocuments })` (private helper)
Calculates a 0–100 score server-side (the user has no control over this):

| Factor | Condition | Points |
|--------|-----------|--------|
| Income | < $10,000/yr | +30 |
| Income | $10k–$19,999 | +20 |
| Income | $20k–$29,999 | +10 |
| Income | ≥ $30,000 | +0 |
| Family | > 5 members | +20 |
| Family | 4–5 members | +10 |
| Family | ≤ 3 members | +0 |
| Urgency | Critical | +30 |
| Urgency | High | +20 |
| Urgency | Medium | +10 |
| Urgency | Low | +5 |
| Documents | At least 1 uploaded | +20 |

##### `priorityLevel(score)` (private helper)
- Returns `'High'` if score ≥ 60
- Returns `'Medium'` if score ≥ 30
- Returns `'Low'` otherwise

##### `applyForFunds(req, res)`
1. Validates all required fields
2. Validates category ∈ `['Medical', 'Education', 'Emergency', 'Other']`
3. Validates urgency ∈ `['Low', 'Medium', 'High', 'Critical']`
4. Collects uploaded file paths from Multer (`req.files`) into a JSON array
5. Calculates priority score and level (server-side, tamper-proof)
6. Inserts a new `applications` row
7. Returns `201 Created` with `{ applicationId, priority_score, priority_level }`

##### `getMyApplications(req, res)`
- Returns all applications WHERE `beneficiary_id = req.user.id`, newest first

##### `getApplicationDetails(req, res)`
- JOINs application with user tables to include `beneficiary_name`, `reviewer_name`
- Access control: beneficiaries can only see their own application; admins see all

---

#### `adminController.js`

##### `scoreBreakdown(app)` (private helper)
Reconstructs the individual factor scores (income, family, urgency, documents) for display in the admin UI.

##### `getAllApplications(req, res)`
- JOINs applications with users (beneficiary and reviewer)
- Orders by `priority_score DESC` (highest priority first), then `created_at ASC` (older first for ties)
- Attaches `score_breakdown` object to each application for the admin UI

##### `approveApplication(req, res)` — Uses a Database Transaction
1. Fetches the application — returns 404 if not found
2. Checks status is `'pending'` — returns 400 if already processed
3. Calculates available funds — returns 400 if insufficient
4. **Begins a transaction:**
   - `UPDATE applications SET status='approved', amount_allocated=?, reviewed_by=?, reviewed_at=NOW()`
   - `INSERT INTO transactions (application_id, beneficiary_id, amount, type='allocation')`
5. **Commits** if both succeed — **rolls back** if either fails
6. Releases the connection back to the pool

The transaction guarantees **atomicity**: either both the approval update and the transaction record are saved, or neither is. This prevents partial states (e.g., money marked as allocated but application still showing pending).

##### `rejectApplication(req, res)`
- Validates application exists and is pending
- Updates status to `'rejected'`, records reviewer and timestamp
- No fund allocation is made

##### `getDashboardStats(req, res)`
Runs 6 separate aggregate queries and returns all stats in one response:
- `total_users`, `total_donations`, `total_applications`
- `pending_applications`, `approved_applications`
- `total_allocated`, `available_funds`

##### `getAllDonations(req, res)`
JOINs donations with users to include `donor_name` and `donor_email`, ordered newest first.

##### `getAllUsers(req, res)`
Returns all users ordered by registration date. **Password field is excluded** from the SELECT.

---

### `init.js` — Database Seeder

A one-time script to set up the database from scratch. Run it with:
```bash
cd backend
node init.js
```

What it does:
1. Connects to MySQL **without** specifying a database
2. Creates the `financial_welfare` database if it doesn't exist
3. Creates all 4 tables (users, donations, applications, transactions) using `CREATE TABLE IF NOT EXISTS`
4. Inserts 5 demo users: 1 admin, 2 donors, 2 beneficiaries
5. Inserts 3 demo donations
6. Inserts 4 demo applications with varying priority scores

It is **idempotent** — safe to run multiple times without creating duplicate data.

---

## Frontend File-by-File Explanation

### `frontend/index.html` + `frontend/js/auth.js`
The **login/register page**. On load, `auth.js` checks if a valid JWT token already exists in `localStorage` — if so, it redirects the user directly to their dashboard.

**`handleLogin(e)`** — Called on login form submit:
1. Reads email and password from inputs
2. POSTs to `/api/auth/login`
3. Saves `token` and `user` object to `localStorage`
4. Calls `redirectByRole(role)` to go to the right dashboard

**`handleRegister(e)`** — Called on register form submit:
1. Validates name, email (format), password (min 6 chars), role
2. POSTs to `/api/auth/register`
3. Immediately calls the login endpoint to auto-login after registration
4. Redirects to the appropriate dashboard

**`redirectByRole(role)`** — Maps roles to dashboard pages:
- `admin` → `/admin.html`
- `donor` → `/donor.html`
- `beneficiary` → `/beneficiary.html`

---

### `frontend/admin.html` + `frontend/js/admin.js`
The **admin dashboard**. On load, `admin.js` verifies the JWT exists and the role is `'admin'`, then calls `loadDashboard()`.

Key functions:
- **`loadDashboard()`** — Fetches stats from `/api/admin/stats`, animates the stat cards, loads recent applications
- **`loadApplications()`** — Fetches all applications from `/api/admin/applications` (priority-sorted), renders them as cards with score breakdown
- **`approveApp(id)`** — Sends `PUT /api/admin/applications/:id/approve`, refreshes the list on success
- **`rejectApp(id)`** — Sends `PUT /api/admin/applications/:id/reject`, refreshes the list on success
- **`loadDonations()`** — Fetches `/api/admin/donations` and renders a table
- **`loadUsers()`** — Fetches `/api/admin/users` and renders a table

---

### `frontend/donor.html` + `frontend/js/donor.js`
The **donor dashboard**. Guards against non-donor access by checking `user.role !== 'donor'` on load.

Key functions:
- **`loadDonations()`** — Fetches the donor's history from `/api/donations/my`, calculates total/average, animates stat numbers
- **`handleDonate(e)`** — Submits a new donation via `POST /api/donations`, shows a success toast, reloads history
- **`setAmount(value)`** — Quick-select buttons that pre-fill the amount field ($10, $25, $50, $100)
- **`renderDonationTable(container, donations)`** — Builds the HTML table from donation data
- **`apiFetch(url, options)`** — Wrapper around `fetch()` that automatically adds the `Authorization: Bearer <token>` header and handles 401/403 by logging out

---

### `frontend/beneficiary.html` + `frontend/js/beneficiary.js`
The **beneficiary dashboard**. Guards against non-beneficiary access.

Key functions:
- **`loadApplications()`** — Fetches the beneficiary's applications from `/api/applications/my`, renders them with status badges and priority scores
- **`handleApply(e)`** — Submits the application form as `multipart/form-data` (to support file uploads) via `POST /api/applications`, shows the returned priority score
- **`updatePriorityPreview()`** — Called on input changes to give the user a real-time estimated priority score before submitting (mirrors the server-side formula)
- **`viewDetails(id)`** — Fetches and displays full details of a single application via `GET /api/applications/:id`
- **`apiFetch(url, options)`** — Same pattern as donor.js; adds auth header, handles token expiry

---

## All API Endpoints (with Examples)

### Auth (Public — no token needed)

#### `POST /api/auth/register`
```json
Request body:
{ "name": "Ali Khan", "email": "ali@example.com", "password": "secret123", "role": "donor" }

Success (201):
{ "message": "User registered successfully", "userId": 6 }

Errors:
400 – missing fields or invalid role
409 – email already registered
```

#### `POST /api/auth/login`
```json
Request body:
{ "email": "ali@example.com", "password": "secret123" }

Success (200):
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "id": 6, "name": "Ali Khan", "email": "ali@example.com", "role": "donor" }
}

Errors:
400 – missing email/password
401 – wrong credentials
```

---

### Donations (Donor Only — Bearer token required)

#### `POST /api/donations`
```json
Request body: { "amount": 500, "message": "For education fund" }
Headers: Authorization: Bearer <token>

Success (201): { "message": "Donation added successfully", "donationId": 4 }
```

#### `GET /api/donations/my`
```json
Headers: Authorization: Bearer <token>

Success (200):
[
  { "id": 4, "donor_id": 6, "amount": "500.00", "message": "For education fund", "created_at": "2024-01-15T10:30:00.000Z" }
]
```

#### `GET /api/donations/total`
```json
Headers: Authorization: Bearer <token>

Success (200):
{ "total_donated": 10000, "total_allocated": 2400, "available_funds": 7600 }
```

---

### Applications (Beneficiary Token Required)

#### `POST /api/applications` — multipart/form-data
```
Fields: phone, address, income, family_members, employment_status, amount, category, reason, urgency
Files (optional): income_proof, id_proof, supporting_docs

Success (201):
{ "message": "Application submitted successfully", "applicationId": 5, "priority_score": 80, "priority_level": "High" }
```

#### `GET /api/applications/my`
Returns array of the beneficiary's own applications.

#### `GET /api/applications/:id`
Returns full application details. Beneficiaries can only access their own; admins can access any.

---

### Admin (Admin Token Required)

#### `GET /api/admin/stats`
```json
{
  "total_users": 5, "total_donations": 10000, "total_applications": 4,
  "pending_applications": 4, "approved_applications": 0,
  "total_allocated": 0, "available_funds": 10000
}
```

#### `GET /api/admin/applications`
Returns all applications sorted by priority score (highest first), each with `score_breakdown`.

#### `PUT /api/admin/applications/:id/approve`
```json
Success (200): { "message": "Application approved successfully", "amount_allocated": 1500 }
Error (400): { "message": "Insufficient funds. Available: $500.00, Requested: $1500.00" }
```

#### `PUT /api/admin/applications/:id/reject`
```json
Success (200): { "message": "Application rejected" }
```

#### `GET /api/admin/donations`
All donations with donor name and email included.

#### `GET /api/admin/users`
All users (password field excluded).

---

## Priority Scoring Algorithm

The priority score is calculated **entirely on the server** in `applicationController.js`. The user cannot manipulate it.

```
Score = Income Points + Family Points + Urgency Points + Document Points
Max Score = 100
```

| Factor | Value | Points |
|--------|-------|--------|
| Income | < $10,000 | +30 |
| | $10k – $19,999 | +20 |
| | $20k – $29,999 | +10 |
| | ≥ $30,000 | 0 |
| Family size | > 5 members | +20 |
| | 4–5 members | +10 |
| | ≤ 3 members | 0 |
| Urgency | Critical | +30 |
| | High | +20 |
| | Medium | +10 |
| | Low | +5 |
| Documents | Any file uploaded | +20 |
| | No documents | 0 |

**Priority Level:**
- **High** (≥ 60) — Served first
- **Medium** (30–59) — Served second
- **Low** (< 30) — Served last

**Example:** Income $8,000 + 6 family members + Critical urgency + 2 docs = 30 + 20 + 30 + 20 = **100 (High)**

---

## Security Implementation

| Concern | Solution |
|---------|---------|
| Password storage | bcrypt with 10 salt rounds — one-way hash, cannot be reversed |
| Authentication | JWT tokens signed with `JWT_SECRET` — expire in 24 hours |
| Authorization | Role check on every protected route via `authorize()` middleware |
| SQL injection | Parameterised queries (`?` placeholders) used everywhere |
| Brute force | Rate limiter: auth routes limited to 20 req/15 min per IP |
| File uploads | MIME type validation (PDF/JPEG/PNG/GIF only), 5 MB size limit |
| Fund allocation | Database transactions ensure atomic approve + deduct operations |
| Token secret | `JWT_SECRET` required from environment; auto-random in dev, fatal error in prod |

---

## Request–Response Flow (End to End)

Here is an example of what happens when a **beneficiary submits an application**:

```
1. Browser (beneficiary.html)
   └─ User fills form, clicks Submit
   └─ beneficiary.js handleApply() builds FormData (fields + files)
   └─ fetch('POST /api/applications', { headers: { Authorization: Bearer <token> } })

2. Express server (server.js)
   └─ Receives the HTTP request
   └─ Rate limiter checks: is this IP under the limit? → Yes, continue

3. Route (routes/applications.js)
   └─ authenticate middleware: verifies JWT token → attaches req.user
   └─ authorize('beneficiary'): checks req.user.role === 'beneficiary' → passes
   └─ Multer: saves uploaded files to /uploads/, puts file info in req.files
   └─ Calls applyForFunds controller

4. Controller (applicationController.js → applyForFunds)
   └─ Validates all fields
   └─ Calculates priority score and level server-side
   └─ Runs INSERT INTO applications (...) query via db pool
   └─ Returns { applicationId: 5, priority_score: 80, priority_level: 'High' }

5. Browser
   └─ Shows toast notification with priority score
   └─ Reloads applications list
```

---

## Quick Start Guide

### Prerequisites
- Node.js ≥ 16
- MySQL ≥ 8.0

### 1. Database Setup (choose one method)

**Option A — Using the init script (recommended):**
```bash
cd backend
cp .env.example .env
# Edit .env with your MySQL credentials
npm install
node init.js
```

**Option B — Using the SQL file:**
```bash
mysql -u root -p < database/schema.sql
```

### 2. Start the Backend
```bash
cd backend
npm start          # production mode
npm run dev        # development mode (auto-restarts on file changes)
```

### 3. Open the App
Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@welfare.org | admin123 |
| Donor | john@donor.com | donor123 |
| Donor | sarah@donor.com | donor123 |
| Beneficiary | maria@beneficiary.com | benef123 |
| Beneficiary | carlos@beneficiary.com | benef123 |

---

## 📄 License
MIT
