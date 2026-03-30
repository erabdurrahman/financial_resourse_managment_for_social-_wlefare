# Entity-Relationship Diagram

## Financial Resource Management System for Social Welfare

![ER Diagram](er-diagram.png)

```mermaid
erDiagram
    USERS {
        int id PK
        varchar(100) name
        varchar(100) email UK
        varchar(255) password
        enum role "admin | donor | beneficiary"
        timestamp created_at
    }

    DONATIONS {
        int id PK
        int donor_id FK
        decimal(10_2) amount
        text message
        timestamp created_at
    }

    APPLICATIONS {
        int id PK
        int beneficiary_id FK
        varchar(30) phone
        text address
        decimal(12_2) income
        int family_members
        varchar(50) employment_status
        decimal(10_2) amount
        enum category "Medical | Education | Emergency | Other"
        text reason
        enum urgency "Low | Medium | High | Critical"
        text documents_path
        int priority_score
        enum priority_level "Low | Medium | High"
        enum status "pending | approved | rejected"
        decimal(10_2) amount_allocated
        int reviewed_by FK
        timestamp reviewed_at
        timestamp created_at
    }

    TRANSACTIONS {
        int id PK
        int application_id FK
        int beneficiary_id FK
        int donor_allocation_id
        decimal(10_2) amount
        enum type "allocation | donation"
        timestamp created_at
    }

    USERS ||--o{ DONATIONS : "makes (donor)"
    USERS ||--o{ APPLICATIONS : "submits (beneficiary)"
    USERS ||--o{ APPLICATIONS : "reviews (admin)"
    USERS ||--o{ TRANSACTIONS : "receives (beneficiary)"
    APPLICATIONS ||--o{ TRANSACTIONS : "generates"
```

## Relationships

| Relationship | Cardinality | Description |
|---|---|---|
| `USERS` → `DONATIONS` | One-to-Many | A donor (user) can make many donations |
| `USERS` → `APPLICATIONS` (beneficiary) | One-to-Many | A beneficiary can submit many applications |
| `USERS` → `APPLICATIONS` (reviewer) | One-to-Many | An admin can review many applications |
| `USERS` → `TRANSACTIONS` | One-to-Many | A beneficiary can receive many fund allocations |
| `APPLICATIONS` → `TRANSACTIONS` | One-to-Many | An approved application generates a transaction |

## Tables Overview

### `users`
Central table for all system actors. The `role` field distinguishes between **admin**, **donor**, and **beneficiary**.

### `donations`
Records every monetary contribution made by a donor. Links back to `users` via `donor_id`. Used to compute the total available fund pool.

### `applications`
The most complex entity — a beneficiary's request for financial assistance. Stores household and income data used to compute a **server-side priority score** (0–100):
- **Income score**: < $10k → +30 | < $20k → +20 | < $30k → +10
- **Family size score**: > 5 members → +20 | > 3 members → +10
- **Urgency score**: Critical → +30 | High → +20 | Medium → +10 | Low → +5
- **Document bonus**: uploaded docs → +20

### `transactions`
Immutable audit log for all fund movements:
- **`allocation`** type: created when an admin approves an application (funds disbursed to beneficiary)
- **`donation`** type: recorded when a donor contributes (funds added to pool)

`available_funds = SUM(donations) − SUM(allocations)`
