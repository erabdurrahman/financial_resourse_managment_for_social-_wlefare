# Data Flow Diagrams (DFD)

## Zero Level DFD (Context Diagram)

The entire system is represented as a single process with three external entities.

```
┌────────────┐  Login Credentials, Application Decisions,   ┌──────────────────────────┐
│            │─────────── User Management Commands ────────>│                          │
│   ADMIN    │                                              │                          │
│            │<── Dashboard Stats, Application List ────────│                          │
└────────────┘    User List, Fund Statistics                │                          │
                                                            │   FINANCIAL RESOURCE     │
┌────────────┐  Login Credentials, Donation Amount,         │   MANAGEMENT FOR         │
│            │──────────── Donation Message ───────────────>│   SOCIAL WELFARE         │
│   DONOR    │                                              │       SYSTEM             │
│            │<─ Donation History, Fund Stats, Confirmation─│                          │
└────────────┘                                              │                          │
                                                            │                          │
┌─────────────────┐  Login Credentials, Application         │                          │
│                 │── Details (Income, Family, Urgency, ───>│                          │
│  BENEFICIARY    │   Documents, Category, Reason)          │                          │
│                 │<─ Application Status, Priority Score ───│                          │
└─────────────────┘  Application Details                    └──────────────────────────┘
```

### External Entities

| Entity       | Input to System                                                  | Output from System                                      |
|--------------|------------------------------------------------------------------|---------------------------------------------------------|
| Admin        | Login credentials, approve/reject decisions, user management     | Dashboard statistics, application list, user list       |
| Donor        | Login credentials, donation amount, donation message             | Donation history, fund statistics, confirmation         |
| Beneficiary  | Login credentials, application form (income, urgency, docs, etc.)| Application status, priority score, approval/rejection  |

---

## Level 1 DFD

The system is decomposed into **5 processes** with **4 data stores**.

```
External Entities:   ADMIN            DONOR           BENEFICIARY
                       │                │                   │
                       │  credentials   │  credentials      │  credentials
                       ▼                ▼                   ▼
              ┌────────────────────────────────────────────────────────┐
              │             P1: USER AUTHENTICATION                    │
              │         (Login / Register / JWT Issuance)              │
              └───────────────────────┬────────────────────────────────┘
                                      │ Read / Write User Records
                                      ▼
                               ┌─────────────┐
                               │  D1: USERS  │  (id, name, email,
                               │   (Table)   │   password_hash, role)
                               └─────────────┘
                                      │
              ────────────────────────┴─────────────────────────
              │  Verified Token + Role                          │  Verified Token + Role
              ▼                                                 ▼
 ┌──────────────────────────────┐          ┌───────────────────────────────────┐
 │   P2: DONATION MANAGEMENT    │          │     P3: APPLICATION MANAGEMENT    │
 │  - Accept donation amount    │          │  - Submit application form        │
 │  - Record in donations table │          │  - Calculate priority score       │
 │  - Retrieve donation history │          │  - Upload supporting documents    │
 │  - Compute fund totals       │          │  - Track application status       │
 └──────────────┬───────────────┘          └─────────────────┬─────────────────┘
                │ Write donation records                      │ Write application records
                ▼                                             ▼
        ┌──────────────────┐                      ┌─────────────────────┐
        │  D2: DONATIONS   │                      │  D3: APPLICATIONS   │
        │    (Table)       │                      │      (Table)        │
        │  donor_id        │                      │  beneficiary_id     │
        │  amount          │                      │  income             │
        │  message         │                      │  family_members     │
        │  created_at      │                      │  urgency            │
        └──────────────────┘                      │  amount, category   │
                                                  │  priority_score     │
                                                  │  priority_level     │
                                                  │  status             │
                                                  │  documents_path     │
                                                  └──────────┬──────────┘
                                                             │ Read pending applications
                                                             ▼
                                             ┌───────────────────────────────┐
                                             │     P4: FUND ALLOCATION       │
                                             │  - Admin reviews application  │
                                             │  - Approve → create txn record│
                                             │  - Reject → update status     │
                                             │  - Check available balance    │
                                             └───────────────┬───────────────┘
                                                             │ Write allocation records
                                                             ▼
                                                   ┌──────────────────────┐
                                                   │  D4: TRANSACTIONS    │
                                                   │      (Table)         │
                                                   │  application_id      │
                                                   │  donor_id            │
                                                   │  amount              │
                                                   │  type = 'allocation' │
                                                   │  created_at          │
                                                   └──────────────────────┘
              │                                                │
              ▼                                                ▼
 ┌──────────────────────────────────────────────────────────────────────────────┐
 │                        P5: REPORTING & STATISTICS                            │
 │  - Total donations collected  → SUM(D2.amount)                               │
 │  - Total allocated            → SUM(D4.amount) WHERE type = 'allocation'     │
 │  - Available balance          → total_donated − total_allocated               │
 │  - Admin view: all applications list, all users list                          │
 │  - Donor view: own donation history, fund totals                              │
 │  - Beneficiary view: own application status & priority score                 │
 └──────────────────────────────┬───────────────────────────────────────────────┘
                                │ Reports / Stats output
          ┌─────────────────────┼──────────────────────────┐
          ▼                     ▼                          ▼
       ADMIN                  DONOR                  BENEFICIARY
  (full statistics,       (donation history,      (application status,
   all applications,       fund totals)            priority score,
   user management)                                approval/rejection)
```

### Process Descriptions

| Process ID | Name                      | Description                                                                                       |
|------------|---------------------------|---------------------------------------------------------------------------------------------------|
| P1         | User Authentication       | Validates login credentials, registers new users, issues JWT tokens, enforces role-based access   |
| P2         | Donation Management       | Accepts donation submissions, stores in D2, computes total donated funds                          |
| P3         | Application Management    | Validates and stores assistance applications in D3, calculates server-side priority score         |
| P4         | Fund Allocation           | Admin approves or rejects applications; approved applications create allocation records in D4      |
| P5         | Reporting & Statistics    | Aggregates data from D2, D3, D4 to produce role-specific dashboards and fund balance              |

### Data Store Descriptions

| Data Store | Table         | Key Fields                                                                   |
|------------|---------------|------------------------------------------------------------------------------|
| D1         | users         | id, name, email, password_hash, role (admin / donor / beneficiary)           |
| D2         | donations     | id, donor_id, amount, message, created_at                                    |
| D3         | applications  | id, beneficiary_id, income, family_members, urgency, amount, category, reason, priority_score, priority_level, status, documents_path |
| D4         | transactions  | id, application_id, donor_id, amount, type, created_at                       |

### Priority Score Formula (P3)

```
Score = Income Factor (0–30) + Family Factor (0–20) + Urgency Factor (0–30) + Documents Factor (0–20)
Maximum Score = 100

Priority Level:
  Score >= 60  →  High
  Score >= 30  →  Medium
  Score <  30  →  Low
```
