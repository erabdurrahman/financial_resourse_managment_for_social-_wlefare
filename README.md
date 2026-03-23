# 💰 Financial Resource Management System for Social Welfare

A full-stack web application that manages financial resources for social welfare organizations — enabling transparent donation tracking, priority-based fund allocation, and beneficiary assistance applications.

---

## ✨ Features

### 👤 Role-based Access
| Role | Capabilities |
|------|-------------|
| **Admin** | Dashboard stats, review & approve/reject applications (priority-ordered), view all donations & users |
| **Donor** | Submit donations with optional message, view personal donation history & stats |
| **Beneficiary** | Apply for financial aid with real-time priority score calculator, track application status |

### 🧮 Smart Priority Scoring
Applications are automatically ranked using a weighted formula:
```
Priority Score = (10 − income_level) × 3 + emergency_level × 4 + need_score × 3
```
- 🟢 High Priority (≥ 60) — served first
- 🟡 Medium Priority (35–59)
- 🔴 Low Priority (< 35)

### 🔐 Security
- JWT-based authentication (24h tokens)
- bcrypt password hashing (10 salt rounds)
- Role-based route protection (middleware)
- Database transactions for fund allocation (atomic)

---

## 🗂️ Project Structure

```
├── database/
│   └── schema.sql           # Database schema + demo data
├── backend/
│   ├── server.js            # Express entry point
│   ├── package.json
│   ├── .env.example
│   ├── config/db.js         # MySQL2 promise pool
│   ├── middleware/auth.js   # JWT authenticate + authorize
│   ├── routes/              # Express routers
│   └── controllers/         # Business logic
└── frontend/
    ├── index.html           # Login / Register page
    ├── admin.html           # Admin dashboard
    ├── donor.html           # Donor dashboard
    ├── beneficiary.html     # Beneficiary dashboard
    ├── css/style.css        # Master stylesheet
    └── js/                  # Per-page JavaScript
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js ≥ 16
- MySQL ≥ 8.0

### 1. Database Setup
```bash
mysql -u root -p < database/schema.sql
```

### 2. Backend Setup
```bash
cd backend
cp .env.example .env
# Edit .env with your DB credentials and a strong JWT_SECRET
npm install
npm start          # production
npm run dev        # development (nodemon)
```

### 3. Access the App
Open [http://localhost:3000](http://localhost:3000)

---

## 👥 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@welfare.org | admin123 |
| Donor | john@donor.com | donor123 |
| Donor | sarah@donor.com | donor123 |
| Beneficiary | maria@beneficiary.com | benef123 |
| Beneficiary | carlos@beneficiary.com | benef123 |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js, Express.js |
| Database | MySQL 8, mysql2 |
| Auth | JWT (jsonwebtoken), bcryptjs |
| Frontend | Vanilla HTML5, CSS3, JavaScript (ES2020) |
| Fonts | Google Fonts – Poppins |

---

## 📡 API Endpoints

### Auth (public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |

### Donations (donor)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/donations` | Submit donation |
| GET | `/api/donations/my` | My donation history |
| GET | `/api/donations/total` | Fund summary |

### Applications (beneficiary)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/applications` | Submit application |
| GET | `/api/applications/my` | My applications |
| GET | `/api/applications/:id` | Application details |

### Admin (admin only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Dashboard statistics |
| GET | `/api/admin/applications` | All applications (priority-sorted) |
| PUT | `/api/admin/applications/:id/approve` | Approve + allocate funds |
| PUT | `/api/admin/applications/:id/reject` | Reject application |
| GET | `/api/admin/donations` | All donations |
| GET | `/api/admin/users` | All users |

---

## 📄 License
MIT
