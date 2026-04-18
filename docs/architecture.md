# System Architecture

## Financial Resource Management for Social Welfare

---

## 1. Architectural Style

**Monolithic 3-Tier Web Application** with role-based access control (RBAC).

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT TIER                            │
│          Vanilla HTML/CSS/JavaScript (Browser)              │
│  index.html  login.html  admin.html  donor.html             │
│  beneficiary.html        /frontend/css/  /frontend/js/      │
└───────────────────────────┬─────────────────────────────────┘
                            │  HTTP/REST (JSON)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   APPLICATION TIER (Node.js)                │
│                     Express.js Server                       │
│                                                             │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │  Middleware  │  │    Routes    │  │   Controllers    │   │
│  │  - CORS      │  │  /api/auth   │  │  authController  │   │
│  │  - JWT Auth  │  │  /api/don..  │  │  donationCtrl    │   │
│  │  - RBAC      │  │  /api/app..  │  │  applicationCtrl │   │
│  │  - Rate Limit│  │  /api/admin  │  │  adminController │   │
│  │  - Multer    │  └──────────────┘  └──────────────────┘   │
│  └─────────────┘                                            │
└───────────────────────────┬─────────────────────────────────┘
                            │  mysql2 driver (TCP)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     DATA TIER (MySQL)                       │
│              Database: financial_welfare                    │
│                                                             │
│   ┌──────────┐  ┌───────────┐  ┌─────────────┐             │
│   │  users   │  │ donations │  │ applications│             │
│   └──────────┘  └───────────┘  └─────────────┘             │
│                  ┌──────────────────┐                       │
│                  │   transactions   │                       │
│                  └──────────────────┘                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Component Breakdown

### 2a. Frontend (Client Tier)

- **Technology**: Vanilla HTML5, CSS3, JavaScript (no framework)
- **Pages & Roles**:
  - `index.html` — Landing/home page
  - `login.html` — Shared authentication page
  - `admin.html` — Admin dashboard (stats, user management, application review, fund allocation)
  - `donor.html` — Donor dashboard (submit donation, view history, see fund totals)
  - `beneficiary.html` — Beneficiary dashboard (submit application, track status/priority score)
- **JS Modules** (`/frontend/js/`):
  - `auth.js` — Login/register, JWT storage
  - `admin.js` — Admin-specific API calls and UI
  - `donor.js` — Donor-specific API calls and UI
  - `beneficiary.js` — Beneficiary-specific API calls and UI
- **Delivery**: Served as static files directly by Express (`express.static`)

### 2b. Application Tier (Backend)

- **Runtime**: Node.js
- **Framework**: Express.js v4
- **Entry point**: `backend/server.js`
- **Key packages**: `bcryptjs`, `jsonwebtoken`, `mysql2`, `multer`, `express-rate-limit`, `cors`, `dotenv`

**Layers within the Application Tier:**

| Layer | Location | Responsibility |
|---|---|---|
| Server / Bootstrap | `server.js` | App init, middleware registration, route mounting, DB health check |
| Routes | `routes/` | URL pattern → controller mapping |
| Controllers | `controllers/` | Business logic, DB queries, response shaping |
| Middleware | `middleware/auth.js` | JWT verification (`authenticate`) + role guard (`authorize`) |
| Config | `config/` | Database connection pool |
| File Storage | `uploads/` | Multer disk storage for document uploads |

**API Surface:**

| Prefix | Consumers | Rate Limit | Description |
|---|---|---|---|
| `POST /api/auth/register` | All | 20/15 min | Register new user |
| `POST /api/auth/login` | All | 20/15 min | Authenticate, receive JWT |
| `GET/POST /api/donations` | Donor | 200/15 min | Submit & list donations |
| `GET/POST /api/applications` | Beneficiary | 200/15 min | Submit & track applications |
| `GET /api/admin/*` | Admin | 200/15 min | Dashboard stats, user list, application review |
| `GET /api/health` | Internal | — | Liveness check |
| `GET *` | Browser | 200/15 min | SPA catch-all → index.html |

**Security Mechanisms:**
- Passwords hashed with **bcryptjs** (cost 10)
- Sessions via **JWT Bearer token** (HS256, secret from env)
- **Rate limiting** on auth endpoints (20 req/15 min) and general API (200 req/15 min)
- File type allow-list enforcement (JPEG, PNG, GIF, PDF; 5 MB max)
- **RBAC** via `authorize('admin')` / `authorize('donor')` / `authorize('beneficiary')` middleware

### 2c. Data Tier (MySQL)

**Tables:**

| Table | Purpose |
|---|---|
| `users` | Central identity store; `role` ENUM distinguishes admin / donor / beneficiary |
| `donations` | Immutable ledger of all donor contributions |
| `applications` | Beneficiary assistance requests with server-computed `priority_score` (0–100) and `priority_level` |
| `transactions` | Audit log of fund movements (`allocation` on approval, `donation` on contribution) |

**Key Computed Field — Priority Score (server-side):**

```
Income < $10k   → +30 | < $20k → +20 | < $30k → +10
Family > 5      → +20 | > 3    → +10
Urgency: Critical → +30 | High → +20 | Medium → +10 | Low → +5
Documents uploaded → +20
────────────────────────────────────────────────────
Max = 100  |  Score ≥ 60 → High  |  ≥ 30 → Medium  |  < 30 → Low
```

**Fund Balance Formula:**

```
available_funds = SUM(donations.amount) − SUM(transactions.amount WHERE type='allocation')
```

---

## 3. Authentication & Authorization Flow

```
Browser                     Express Server              MySQL
  │                               │                        │
  │── POST /api/auth/login ───────>│                        │
  │   {email, password}           │── SELECT user ─────────>│
  │                               │<── user row ────────────│
  │                               │  bcrypt.compare(pw)     │
  │<── 200 {token, role} ─────────│  jwt.sign({id, role})   │
  │                               │                        │
  │── GET /api/applications ──────>│                        │
  │   Authorization: Bearer <tok> │  authenticate mw        │
  │                               │  authorize('benef.') mw │
  │                               │── SELECT applications ──>│
  │<── 200 [{...}] ───────────────│<── rows ────────────────│
```

---

## 4. File Upload Flow

```
Browser ──── multipart/form-data ──── Express (Multer)
                                           │
                                    Validate MIME type
                                    (jpeg/png/gif/pdf, max 5 MB)
                                           │
                                    Write to /uploads/<uuid>.<ext>
                                           │
                                    Store JSON array of paths
                                    in applications.documents_path
```

Accepted upload fields per application:

| Field name | Max files |
|---|---|
| `income_proof` | 1 |
| `id_proof` | 1 |
| `supporting_docs` | 3 |

---

## 5. Deployment Topology (Current / Single-Machine)

```
┌─────────────────────────────────────┐
│           Single Server             │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  Node.js (port 3000)        │   │
│  │  Express serves:            │   │
│  │  - Static frontend files    │   │
│  │  - REST API endpoints       │   │
│  │  - Uploaded documents       │   │
│  └────────────┬────────────────┘   │
│               │ localhost TCP       │
│  ┌────────────▼────────────────┐   │
│  │  MySQL Server               │   │
│  │  DB: financial_welfare      │   │
│  └─────────────────────────────┘   │
│               │                    │
│  /uploads/  (local disk)           │
└─────────────────────────────────────┘
```

**Configuration via `.env`** (copy from `backend/.env.example`):

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | HTTP server port |
| `JWT_SECRET` | *(required in production)* | HMAC-SHA256 signing key |
| `DB_HOST` | `localhost` | MySQL host |
| `DB_PORT` | `3306` | MySQL port |
| `DB_USER` | `root` | MySQL user |
| `DB_PASSWORD` | *(empty)* | MySQL password |
| `DB_NAME` | `financial_welfare` | MySQL database name |
| `NODE_ENV` | `development` | `development` or `production` |

---

## 6. Role-Based Access Summary

| Feature | Admin | Donor | Beneficiary |
|---|:---:|:---:|:---:|
| Register / Login | ✓ | ✓ | ✓ |
| Submit Donation | — | ✓ | — |
| View Own Donations | — | ✓ | — |
| Submit Application | — | — | ✓ |
| View Own Applications | — | — | ✓ |
| View All Applications | ✓ | — | — |
| Approve / Reject Applications | ✓ | — | — |
| Manage Users | ✓ | — | — |
| View Fund Statistics | ✓ | ✓ (partial) | — |

---

## 7. Key Architectural Decisions & Trade-offs

| Decision | Current Choice | Trade-off |
|---|---|---|
| Frontend architecture | Vanilla JS multi-page | Simple to deploy; limited scalability of UI complexity |
| API style | REST / JSON | Standard; no real-time updates |
| Auth mechanism | Stateless JWT | Scalable; no server-side session store needed; tokens can't be revoked before expiry |
| Database | MySQL (relational) | Strong ACID guarantees for financial transactions; schema changes need migrations |
| File storage | Local disk | Simple; doesn't scale horizontally without shared storage (e.g., S3) |
| Priority scoring | Server-side only | Prevents client manipulation; logic is centralized in `applicationController.js` |
| Single process | Monolith | Easy to run locally; would need containerization + load balancer for horizontal scale |

---

## 8. Suggested Evolution Path (if scaling is needed)

1. **Reverse proxy** — Put Nginx in front of Node.js to handle TLS, compression, and static file serving more efficiently
2. **Cloud file storage** — Replace local `/uploads/` with S3-compatible object storage
3. **Token revocation** — Add a Redis-backed token blacklist or use short-lived tokens with refresh tokens
4. **DB migrations** — Introduce a migration tool (e.g., `db-migrate`, `Flyway`) instead of raw `schema.sql`
5. **Frontend framework** — Migrate to React/Vue for complex UI state management
6. **Containerization** — Dockerize Node.js and MySQL for consistent deployment

---

## Related Documentation

| Document | Location |
|---|---|
| Entity-Relationship Diagram | [`docs/er-diagram.md`](er-diagram.md) |
| Data Flow Diagrams (Level 0 & 1) | [`docs/dfd.md`](dfd.md) |
| Use Case Diagram | [`docs/use-case-diagram.md`](use-case-diagram.md) |
| System Flow Diagram | [`docs/flow-diagram.md`](flow-diagram.md) |
| Database Schema (SQL) | [`database/schema.sql`](../database/schema.sql) |
| Project Report | [`PROJECT_REPORT.md`](../PROJECT_REPORT.md) |
