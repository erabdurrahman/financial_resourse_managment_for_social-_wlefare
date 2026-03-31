# Flow Diagram

## Financial Resource Management System for Social Welfare

![Overall System Flow Diagram](flow-diagram.png)

---

## 1. Overall System Flow

```mermaid
flowchart TD
    User([👤 User Visits System]) --> Auth{Authenticated?}
    Auth -- No --> Login[Login / Register Page]
    Login --> Creds[Enter Credentials]
    Creds --> Verify{Valid?}
    Verify -- No --> ErrMsg[Show Error Message]
    ErrMsg --> Login
    Verify -- Yes --> Role{User Role?}

    Role -- Admin --> AdminDash[🛠️ Admin Dashboard]
    Role -- Donor --> DonorDash[💰 Donor Dashboard]
    Role -- Beneficiary --> BenefDash[📄 Beneficiary Dashboard]

    AdminDash --> A1[View Statistics]
    AdminDash --> A2[Review Applications]
    AdminDash --> A3[Manage Users]

    DonorDash --> D1[Submit Donation]
    DonorDash --> D2[View Donation History]
    DonorDash --> D3[View Fund Statistics]

    BenefDash --> B1[Submit Application]
    BenefDash --> B2[Track Application Status]
    BenefDash --> B3[View Application Details]

    A2 --> Approve{Approve / Reject?}
    Approve -- Approve --> AllocFunds[Allocate Funds\nCreate Transaction Record]
    Approve -- Reject --> RejectApp[Mark Application Rejected]

    D1 --> FundPool[(💵 Fund Pool\nAvailable Balance)]
    AllocFunds --> FundPool
```

---

## 2. User Registration & Authentication Flow

```mermaid
flowchart TD
    Start([User Opens Login Page]) --> Choice{New or Existing?}

    Choice -- New User --> Register[Fill Registration Form\nName · Email · Password · Role]
    Register --> ValReg{Input Valid?}
    ValReg -- No --> RegErr[Show Validation Error]
    RegErr --> Register
    ValReg -- Yes --> RoleCheck{Role Selected?}
    RoleCheck -- admin --> DenyAdmin[❌ Admin role\nnot self-registerable]
    RoleCheck -- donor / beneficiary --> HashPwd[Hash Password\nwith bcrypt]
    HashPwd --> SaveUser[(Save User\nto DB)]
    SaveUser --> GenToken[Generate JWT Token]

    Choice -- Existing User --> LoginForm[Enter Email & Password]
    LoginForm --> RateLimit{Rate Limit\nOK?}
    RateLimit -- Exceeded --> Block[❌ Too Many Requests\nTry Again in 15 min]
    RateLimit -- OK --> FindUser[(Lookup User\nin DB)]
    FindUser --> Exists{User Found?}
    Exists -- No --> WrongCred[❌ Invalid Credentials]
    Exists -- Yes --> ComparePwd[Compare Password\nwith bcrypt]
    ComparePwd --> PwdMatch{Match?}
    PwdMatch -- No --> WrongCred
    PwdMatch -- Yes --> GenToken

    GenToken --> StoreToken[Store JWT in\nlocalStorage]
    StoreToken --> Redirect{Redirect by Role}
    Redirect -- Admin --> AdminDash[/admin.html/]
    Redirect -- Donor --> DonorDash[/donor.html/]
    Redirect -- Beneficiary --> BenefDash[/beneficiary.html/]
```

---

## 3. Donation Submission Flow

```mermaid
flowchart TD
    Donor([💰 Donor]) --> Dashboard[Donor Dashboard]
    Dashboard --> DonateBtn[Click 'Donate' Button]
    DonateBtn --> FillForm[Fill Donation Form\nAmount · Message optional]
    FillForm --> Submit[Submit]

    Submit --> JWTCheck{JWT Valid?}
    JWTCheck -- No --> Unauthorized[❌ 401 Unauthorized\nRedirect to Login]
    JWTCheck -- Yes --> RoleCheck{Role = donor?}
    RoleCheck -- No --> Forbidden[❌ 403 Forbidden]
    RoleCheck -- Yes --> ValAmount{Amount > 0?}
    ValAmount -- No --> AmtErr[❌ Invalid Amount]
    ValAmount -- Yes --> SaveDonation[(INSERT into\ndonations table)]

    SaveDonation --> UpdatePool[Fund Pool\nIncreases]
    UpdatePool --> Success[✅ Donation Successful\nShow Confirmation]
    Success --> RefreshHistory[Reload Donation History]
    RefreshHistory --> Dashboard
```

---

## 4. Beneficiary Application Submission Flow

```mermaid
flowchart TD
    Benef([📄 Beneficiary]) --> Dashboard[Beneficiary Dashboard]
    Dashboard --> AppBtn[Click 'Apply for Funds']
    AppBtn --> FillForm[Fill Application Form\nPhone · Address · Income\nFamily Members · Employment\nAmount Requested · Category\nReason · Urgency Level]
    FillForm --> UploadDocs[Upload Supporting Documents\nIncome Proof · ID Proof · Other\nMax 5 MB each PDF/JPEG/PNG/GIF]

    UploadDocs --> Submit[Submit Application]
    Submit --> JWTCheck{JWT Valid?}
    JWTCheck -- No --> Unauthorized[❌ 401 Unauthorized]
    JWTCheck -- Yes --> RoleCheck{Role = beneficiary?}
    RoleCheck -- No --> Forbidden[❌ 403 Forbidden]
    RoleCheck -- Yes --> FileCheck{Files Valid?\nType & Size}
    FileCheck -- No --> FileErr[❌ Invalid File\nType or Size]
    FileCheck -- Yes --> CalcScore[Calculate Priority Score\nsee Algorithm Flow]

    CalcScore --> SaveApp[(INSERT into\napplications table\nstatus = pending)]
    SaveApp --> Notify[✅ Application Submitted\nAwaiting Admin Review]
    Notify --> TrackStatus[Beneficiary Can\nTrack Status]

    TrackStatus --> StatusPoll{Status?}
    StatusPoll -- pending --> Waiting[⏳ Awaiting Review]
    StatusPoll -- approved --> Approved[✅ Approved\nFunds Allocated]
    StatusPoll -- rejected --> Rejected[❌ Application Rejected]
```

---

## 5. Priority Scoring Algorithm Flow

```mermaid
flowchart TD
    Input([Application Data]) --> InitScore[score = 0]

    InitScore --> IncomeCheck{Monthly Income?}
    IncomeCheck -- "< $10k" --> Inc30[score += 30]
    IncomeCheck -- "$10k – $20k" --> Inc20[score += 20]
    IncomeCheck -- "$20k – $30k" --> Inc10[score += 10]
    IncomeCheck -- "> $30k" --> Inc0[score += 0]

    Inc30 --> FamilyCheck{Family Members?}
    Inc20 --> FamilyCheck
    Inc10 --> FamilyCheck
    Inc0 --> FamilyCheck

    FamilyCheck -- "> 5 members" --> Fam20[score += 20]
    FamilyCheck -- "4 – 5 members" --> Fam10[score += 10]
    FamilyCheck -- "≤ 3 members" --> Fam0[score += 0]

    Fam20 --> UrgencyCheck{Urgency Level?}
    Fam10 --> UrgencyCheck
    Fam0 --> UrgencyCheck

    UrgencyCheck -- Critical --> Urg30[score += 30]
    UrgencyCheck -- High --> Urg20[score += 20]
    UrgencyCheck -- Medium --> Urg10[score += 10]
    UrgencyCheck -- Low --> Urg5[score += 5]

    Urg30 --> DocCheck{Documents\nUploaded?}
    Urg20 --> DocCheck
    Urg10 --> DocCheck
    Urg5 --> DocCheck

    DocCheck -- Yes --> Doc20[score += 20]
    DocCheck -- No --> Doc0[score += 0]

    Doc20 --> FinalScore[Final Score 0–100]
    Doc0 --> FinalScore

    FinalScore --> PriorityLevel{Priority Level}
    PriorityLevel -- "score ≥ 70" --> High[🔴 HIGH Priority]
    PriorityLevel -- "score 40–69" --> Medium[🟡 MEDIUM Priority]
    PriorityLevel -- "score < 40" --> Low[🟢 LOW Priority]

    High --> SavePriority[(Save priority_score\n& priority_level\nto DB)]
    Medium --> SavePriority
    Low --> SavePriority
```

---

## 6. Admin Review & Fund Allocation Flow

```mermaid
flowchart TD
    Admin([🛠️ Admin]) --> Dashboard[Admin Dashboard]
    Dashboard --> ViewStats[View Statistics\nTotal Donations · Allocations\nAvailable Funds · User Counts]
    Dashboard --> ViewApps[View All Applications\nSorted by Priority Score]

    ViewApps --> SelectApp[Select Application\nto Review]
    SelectApp --> ViewDetails[View Application Details\nIncome · Family · Documents\nPriority Score · Urgency]

    ViewDetails --> Decision{Admin Decision}
    Decision -- Approve --> EnterAmt[Enter Allocation Amount]
    EnterAmt --> CheckFunds{Available Funds\nSufficient?}
    CheckFunds -- No --> InsufficientFunds[❌ Insufficient Funds\nReduce Amount]
    InsufficientFunds --> EnterAmt
    CheckFunds -- Yes --> UpdateApp[(UPDATE application\nstatus = approved\namount_allocated = X\nreviewed_by = admin_id\nreviewed_at = now)]
    UpdateApp --> CreateTx[(INSERT into\ntransactions table\ntype = allocation)]
    CreateTx --> DeductPool[Fund Pool\nDecreases by X]
    DeductPool --> NotifySuccess[✅ Application Approved\nFunds Allocated]

    Decision -- Reject --> RejectReason[Mark as Rejected]
    RejectReason --> UpdateRejected[(UPDATE application\nstatus = rejected\nreviewed_by = admin_id\nreviewed_at = now)]
    UpdateRejected --> NotifyRejected[❌ Application Rejected]

    NotifySuccess --> RefreshDash[Refresh Dashboard]
    NotifyRejected --> RefreshDash
    RefreshDash --> Dashboard
```

---

## 7. Fund Pool Calculation Flow

```mermaid
flowchart LR
    Donors([💰 Donors]) -->|Submit Donations| DonationsTable[(donations table)]
    DonationsTable -->|SUM of all amounts| TotalDonations[Total Donations]

    Admins([🛠️ Admins]) -->|Approve Applications| TransactionsTable[(transactions table\ntype = allocation)]
    TransactionsTable -->|SUM of all amounts| TotalAllocations[Total Allocations]

    TotalDonations --> Calc["Available Funds =\nTotal Donations − Total Allocations"]
    TotalAllocations --> Calc

    Calc --> Display[📊 Displayed on\nAll Dashboards]
```

---

## 8. API Request–Response Flow

```mermaid
flowchart TD
    Client([🌐 Browser Client]) -->|HTTP Request + JWT| RateLimit[Rate Limiter\nMiddleware]
    RateLimit -->|OK| CORS[CORS Middleware]
    CORS -->|OK| Router[Express Router\nMatch Route]

    Router -->|Public Route /api/auth| AuthCtrl[Auth Controller\nNo JWT needed]
    Router -->|Protected Route| JWTMiddleware[JWT Middleware\nVerify Token]

    JWTMiddleware -->|Invalid / Expired| Reject401[❌ 401 Unauthorized]
    JWTMiddleware -->|Valid| RoleMiddleware{Check Role\nRequired?}

    RoleMiddleware -- Yes --> RoleMatch{Role Matches?}
    RoleMatch -- No --> Reject403[❌ 403 Forbidden]
    RoleMatch -- Yes --> Controller[Route Controller]
    RoleMiddleware -- No --> Controller

    Controller --> DBQuery[(MySQL Database\nQuery)]
    DBQuery -->|Success| FormatRes[Format JSON Response]
    DBQuery -->|Error| DBError[❌ 500 Server Error]

    AuthCtrl --> DBQuery
    FormatRes -->|JSON| Client
    DBError -->|JSON Error| Client
```
