# Use Case Diagram

## Financial Resource Management System for Social Welfare

![Use Case Diagram](use-case-diagram.png)

```plantuml
@startuml Financial Resource Management - Use Case Diagram

left to right direction

skinparam actorStyle awesome
skinparam backgroundColor #FAFAFA
skinparam usecase {
    BackgroundColor #E8F4FD
    BorderColor #2980B9
    ArrowColor #2C3E50
    ActorBackgroundColor #FADBD8
    ActorBorderColor #E74C3C
}
skinparam note {
    BackgroundColor #FEF9E7
    BorderColor #F39C12
}
skinparam packageStyle rectangle
skinparam shadowing false
skinparam roundcorner 10

title Financial Resource Management System for Social Welfare\nUse Case Diagram

' ─────────────────────────────────────────────────
'  ACTORS
' ─────────────────────────────────────────────────
actor "Guest\n(Unregistered)" as Guest #LightGrey
actor "Donor"                 as Donor #FFD700
actor "Beneficiary"           as Beneficiary #90EE90
actor "Admin"                 as Admin #FFB6C1

' ─────────────────────────────────────────────────
'  SYSTEM BOUNDARY
' ─────────────────────────────────────────────────
rectangle "Financial Resource Management System" {

    ' ── Authentication ──────────────────────────
    package "Authentication" {
        usecase "Register Account"   as UC_Register
        usecase "Login"              as UC_Login
        usecase "Logout"             as UC_Logout
    }

    ' ── Donation Management ─────────────────────
    package "Donation Management" {
        usecase "Make Donation"           as UC_Donate
        usecase "View My Donations"       as UC_MyDonations
        usecase "View Total Fund Summary" as UC_FundSummary
    }

    ' ── Application Management ──────────────────
    package "Application Management" {
        usecase "Apply for Financial\nAssistance"  as UC_Apply
        usecase "Upload Supporting\nDocuments"     as UC_Upload
        usecase "View My Applications"             as UC_MyApps
        usecase "Track Application Status"         as UC_TrackStatus
        usecase "View Application Details"         as UC_AppDetails
    }

    ' ── Priority Scoring ────────────────────────
    package "Priority Scoring" {
        usecase "Calculate Priority\nScore (Auto)"  as UC_Priority
    }

    ' ── Admin Management ────────────────────────
    package "Admin Panel" {
        usecase "View Dashboard\nStatistics"            as UC_Dashboard
        usecase "View All Applications\n(by Priority)"  as UC_AllApps
        usecase "Approve Application\n& Allocate Funds" as UC_Approve
        usecase "Reject Application"                    as UC_Reject
        usecase "View All Donations"                    as UC_AllDonations
        usecase "View All Users"                        as UC_AllUsers
        usecase "Check Fund\nAvailability"              as UC_FundCheck
    }

}

' ─────────────────────────────────────────────────
'  GUEST ASSOCIATIONS
' ─────────────────────────────────────────────────
Guest --> UC_Register
Guest --> UC_Login

' ─────────────────────────────────────────────────
'  DONOR ASSOCIATIONS
' ─────────────────────────────────────────────────
Donor --> UC_Login
Donor --> UC_Logout
Donor --> UC_Donate
Donor --> UC_MyDonations
Donor --> UC_FundSummary

' ─────────────────────────────────────────────────
'  BENEFICIARY ASSOCIATIONS
' ─────────────────────────────────────────────────
Beneficiary --> UC_Login
Beneficiary --> UC_Logout
Beneficiary --> UC_Apply
Beneficiary --> UC_MyApps
Beneficiary --> UC_TrackStatus
Beneficiary --> UC_AppDetails

' ─────────────────────────────────────────────────
'  ADMIN ASSOCIATIONS
' ─────────────────────────────────────────────────
Admin --> UC_Login
Admin --> UC_Logout
Admin --> UC_Dashboard
Admin --> UC_AllApps
Admin --> UC_Approve
Admin --> UC_Reject
Admin --> UC_AllDonations
Admin --> UC_AllUsers

' ─────────────────────────────────────────────────
'  INCLUDE / EXTEND RELATIONSHIPS
' ─────────────────────────────────────────────────
UC_Apply   ..> UC_Upload    : <<extend>>\n(optional documents)
UC_Apply   ..> UC_Priority  : <<include>>\n(auto-calculated)
UC_Approve ..> UC_FundCheck : <<include>>\n(check available funds)

UC_MyApps  ..> UC_AppDetails : <<extend>>
UC_AllApps ..> UC_AppDetails : <<extend>>

' ─────────────────────────────────────────────────
'  NOTES
' ─────────────────────────────────────────────────
note right of UC_Priority
  Score factors (max 100):
  • Income      : up to +30
  • Family size : up to +20
  • Urgency     : up to +30
  • Documents   :      +20
end note

note right of UC_Approve
  Funds allocated only if
  available_funds >= requested amount.
  Creates an immutable transaction record.
end note

note bottom of Admin
  Admin accounts are
  pre-seeded in the DB.
  Cannot self-register.
end note

@enduml
```

---

## Actors

| Actor | Description |
|---|---|
| **Guest (Unregistered)** | Any visitor who has not yet logged in. Can only register or log in. |
| **Donor** | Authenticated user who contributes funds to the welfare pool. |
| **Beneficiary** | Authenticated user who applies for and receives financial assistance. |
| **Admin** | Platform administrator who reviews applications and manages the system. Admin accounts are pre-seeded; they cannot self-register. |

---

## Use Cases by Module

### Authentication
| Use Case | Actors | Description |
|---|---|---|
| Register Account | Guest | Create a new account with role `donor` or `beneficiary`. |
| Login | Guest, Donor, Beneficiary, Admin | Authenticate and receive a signed JWT (24 h expiry). |
| Logout | Donor, Beneficiary, Admin | Invalidate the session on the client side. |

### Donation Management
| Use Case | Actor | Description |
|---|---|---|
| Make Donation | Donor | Submit a monetary contribution (amount + optional message) to the welfare fund pool. |
| View My Donations | Donor | List all past donations made by the logged-in donor. |
| View Total Fund Summary | Donor | See `total_donated`, `total_allocated`, and `available_funds`. |

### Application Management
| Use Case | Actor | Description |
|---|---|---|
| Apply for Financial Assistance | Beneficiary | Submit an application with income, family size, urgency, category, and requested amount. |
| Upload Supporting Documents | Beneficiary | Attach income proof, ID proof, and supporting docs to the application *(extends Apply)*. |
| View My Applications | Beneficiary | List all applications submitted by the logged-in beneficiary. |
| Track Application Status | Beneficiary | See whether an application is `pending`, `approved`, or `rejected`. |
| View Application Details | Beneficiary, Admin | Retrieve full details of a single application including reviewer info. |

### Priority Scoring *(automated)*
| Use Case | Trigger | Description |
|---|---|---|
| Calculate Priority Score (Auto) | Included in *Apply for Financial Assistance* | Server calculates a score (0–100) based on income, family size, urgency, and document upload. Users cannot influence this calculation directly. |

**Score breakdown:**

| Factor | Condition | Points |
|---|---|---|
| Income | < $10,000 / yr | +30 |
| Income | $10,000–$19,999 | +20 |
| Income | $20,000–$29,999 | +10 |
| Family size | > 5 members | +20 |
| Family size | > 3 members | +10 |
| Urgency | Critical | +30 |
| Urgency | High | +20 |
| Urgency | Medium | +10 |
| Urgency | Low | +5 |
| Documents | At least one uploaded | +20 |

### Admin Panel
| Use Case | Actor | Description |
|---|---|---|
| View Dashboard Statistics | Admin | Overview metrics: total users, donations, applications, funds allocated, and available balance. |
| View All Applications (by Priority) | Admin | List all applications sorted by priority score (highest first). |
| Approve Application & Allocate Funds | Admin | Mark application as `approved`, deduct from fund pool, and create a transaction record. Includes *Check Fund Availability*. |
| Reject Application | Admin | Mark application as `rejected` without allocating funds. |
| View All Donations | Admin | List all donations from all donors with donor details. |
| View All Users | Admin | List all registered users (passwords excluded). |
| Check Fund Availability | System | Included in *Approve Application* — verifies `available_funds >= requested amount` before approving. |

---

## Relationships

| Relationship | Type | Description |
|---|---|---|
| Apply → Upload Documents | `<<extend>>` | Documents are optional; uploading extends the base application flow. |
| Apply → Calculate Priority Score | `<<include>>` | Priority score is always calculated automatically when an application is submitted. |
| Approve Application → Check Fund Availability | `<<include>>` | Fund check is always performed before approval. |
| View My Applications → View Application Details | `<<extend>>` | Beneficiary can drill into a specific application. |
| View All Applications → View Application Details | `<<extend>>` | Admin can drill into a specific application. |
