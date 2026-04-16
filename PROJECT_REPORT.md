# PROJECT REPORT

## FINANCIAL RESOURCE MANAGEMENT FOR SOCIAL WELFARE

---

**Submitted in partial fulfillment of the requirements for the degree of**
**Bachelor of Computer Applications / Bachelor of Technology (Computer Science)**

---

| | |
|---|---|
| **Project Title** | Financial Resource Management for Social Welfare |
| **Application Name** | FinWelfare |
| **Technology Stack** | Node.js · Express.js · MySQL · HTML5 · CSS3 · JavaScript |
| **Academic Year** | 2024–2025 |

---

---

# TABLE OF CONTENTS

| Chapter No. | Topics | Page No. |
|---|---|---|
| **CHAPTER 1** | **INTRODUCTION** | **01** |
| 1.1 | Overview | 01 |
| 1.2 | Problem Statement | 02 |
| 1.3 | Project Objectives | 03 |
| 1.4 | Report Layout | 04 |
| **CHAPTER 2** | **FEASIBILITY STUDY** | **05** |
| 2.1 | Technical Feasibility | 05 |
| 2.2 | Operational Feasibility | 07 |
| 2.3 | Economic Feasibility | 08 |
| 2.4 | System Requirements | 09 |
| 2.4.1 | Hardware Requirements | 09 |
| 2.4.2 | Software Requirements | 10 |
| **CHAPTER 3** | **SYSTEM ANALYSIS** | **11** |
| 3.1 | Methodology | 11 |
| 3.2 | Development Methodology | 12 |
| 3.3 | Development Model | 13 |
| 3.4 | Deployment | 14 |
| 3.5 | Training and User Support | 15 |
| **CHAPTER 4** | **SYSTEM DESIGN** | **16** |
| 4.1 | Module Description | 16 |
| 4.2 | Data Flow Diagram | 20 |
| 4.2.1 | 0 Level DFD (Context Diagram) | 21 |
| 4.2.2 | 1 Level DFD | 22 |
| 4.3 | Entity Relationship (ER) Diagram | 23 |
| 4.4 | API Design | 25 |
| **CHAPTER 5** | **SYSTEM IMPLEMENTATION** | **27** |
| 5.1 | Express.js | 27 |
| 5.2 | Node.js | 28 |
| 5.3 | MySQL | 29 |
| 5.4 | JSON Web Token (JWT) | 30 |
| 5.5 | Multer (File Upload) | 31 |
| 5.6 | bcryptjs (Password Hashing) | 31 |
| 5.7 | Code | 32 |
| 5.8 | Snapshot (Screen Captures) | 40 |
| **CHAPTER 6** | **SYSTEM TESTING** | **42** |
| 6.1 | Testing Methodologies | 42 |
| 6.2 | Unit Testing | 43 |
| 6.3 | Integration Testing | 44 |
| 6.4 | Security Testing | 45 |
| 6.5 | Testing under Various States | 46 |
| **CHAPTER 7** | **CONCLUSION AND FUTURE SCOPE** | **48** |
| 7.1 | Conclusion | 48 |
| 7.2 | Future Scope | 49 |
| **CHAPTER 8** | **REFERENCES** | **51** |
| 8.1 | Books | 51 |
| 8.2 | Research Papers and Articles | 51 |
| 8.3 | Websites | 52 |
| 8.4 | Online Documentation | 52 |

---

# LIST OF FIGURES

| Figure No. | Figure Name | Page No. |
|---|---|---|
| Figure 4.1.1 | System Architecture Overview | 16 |
| Figure 4.1.2 | Module Interaction Diagram | 19 |
| Figure 4.2.1 | 0 Level DFD (Context Diagram) | 21 |
| Figure 4.2.2 | 1 Level DFD | 22 |
| Figure 4.3.1 | ER Diagram | 23 |
| Figure 4.4.1 | API Endpoint Overview | 26 |
| Figure 5.7.1 | Home / Landing Page | 40 |
| Figure 5.7.2 | Login Page | 40 |
| Figure 5.7.3 | Signup / Registration Page | 41 |
| Figure 5.7.4 | Donor Dashboard | 41 |
| Figure 5.7.5 | Beneficiary Dashboard | 41 |
| Figure 5.7.6 | Admin Dashboard | 42 |

---

# LIST OF TABLES

| Table No. | Table Name | Page No. |
|---|---|---|
| Table 2.1 | Software Requirements | 10 |
| Table 2.2 | Hardware Requirements | 09 |
| Table 4.1 | Module Summary | 17 |
| Table 4.2 | Database Tables Overview | 24 |
| Table 4.3 | API Endpoints List | 25 |
| Table 5.1 | Priority Score Calculation Matrix | 35 |
| Table 6.1 | Test Cases — Authentication Module | 43 |
| Table 6.2 | Test Cases — Donation Module | 44 |
| Table 6.3 | Test Cases — Application Module | 44 |
| Table 6.4 | Test Cases — Admin Module | 45 |
| Table 6.5 | Security Test Results | 46 |

---

---

# CHAPTER 1: INTRODUCTION

## 1.1 Overview

In contemporary society, social welfare organisations, non-governmental organisations (NGOs), and government-assisted trusts manage vast pools of donated funds that are meant to reach the most vulnerable members of society. However, a recurring challenge across these institutions is the absence of a structured, transparent, and technology-driven mechanism to receive donations, evaluate funding requests from beneficiaries, and disburse money in a fair and accountable manner.

**FinWelfare** — Financial Resource Management for Social Welfare — is a full-stack web application developed to solve exactly this problem. It provides a unified digital platform that bridges the gap between donors who wish to contribute funds and beneficiaries who need financial assistance, with an independent administrator role overseeing the entire process.

The platform is built upon the **MEEN stack** principle: **MySQL** as the relational database, **Express.js** as the web framework, **Node.js** as the server runtime, and plain **HTML5 / CSS3 / JavaScript** for the client-side interface. This combination was chosen because it is lightweight, performant, and requires no heavy build tools — making it accessible to deploy on minimal infrastructure.

FinWelfare is structured around three primary user roles:

1. **Admin** — The platform administrator who oversees all users, reviews applications, approves or rejects fund requests, and monitors financial statistics through a real-time dashboard.
2. **Donor** — An individual or organisation that contributes funds to the welfare pool. Donors can track their donation history and see how much of the total pool has been utilised.
3. **Beneficiary** — An individual in financial need who submits an application for monetary assistance. Applications include personal financial details, family information, and supporting documents, all of which feed into a server-side priority scoring algorithm.

What distinguishes FinWelfare from a simple donation portal is its **automated priority scoring engine**. When a beneficiary submits an application, the server calculates a priority score out of 100 based on their monthly income, family size, urgency level, and whether supporting documents were uploaded. This score is invisible to the applicant — it cannot be gamed or manipulated. Administrators then see applications ranked from most critical to least, enabling fair and data-driven fund allocation decisions.

Security is implemented at multiple layers. Passwords are hashed using **bcryptjs** (industry-standard bcrypt algorithm). User sessions are managed via **JSON Web Tokens (JWT)**, which expire after 24 hours. API endpoints are protected by both authentication middleware and role-based authorisation middleware, ensuring that donors cannot access admin endpoints and beneficiaries cannot access donor history. Additionally, **express-rate-limit** is applied to all routes to prevent brute-force and denial-of-service attacks.

The database layer uses **MySQL** with proper relational schema design including foreign key constraints, index optimisation, and atomic transactions for fund allocation operations. The `transactions` table serves as an immutable audit log, recording every donation and every fund allocation so that the financial flow can always be traced end-to-end.

This project was developed as a practical academic exercise to demonstrate mastery of web application development, database design, RESTful API architecture, and web security fundamentals.

---

## 1.2 Problem Statement

Social welfare funding, at both governmental and non-governmental levels, suffers from several well-documented inefficiencies:

**Lack of Transparency:** Donors contribute funds without any visibility into how their money is used. There is no mechanism to see total funds collected, how much has been allocated, and to whom. This erodes donor trust over time.

**No Standardised Evaluation Criteria:** When multiple beneficiaries apply for assistance simultaneously, there is no objective methodology to determine who gets priority. Decisions are often subjective, inconsistent, and potentially biased.

**Paper-Based or Spreadsheet-Based Management:** Many smaller welfare organisations still manage applications through paper forms or Microsoft Excel spreadsheets. This approach is error-prone, slow, difficult to audit, and completely inaccessible to remote users.

**Absence of Role Separation:** In manually managed systems, the same person often acts as donor manager, application reviewer, and fund disburser. This concentration of responsibilities creates opportunities for misappropriation.

**No Real-Time Fund Tracking:** Neither donors nor administrators have access to a real-time view of the welfare fund's financial health — total collected, total disbursed, and balance available for new applications.

**Insecure Data Handling:** Personal and financial information of beneficiaries, including income details, family size, and uploaded documents, is often stored in insecure file cabinets or unencrypted spreadsheets.

The need, therefore, is for a **centralised, secure, transparent, and role-aware web platform** that automates fund collection, objectively scores and prioritises applications, ensures atomic and auditable fund disbursement, and provides all stakeholders with real-time visibility into the system's financial status. FinWelfare is the direct answer to this need.

---

## 1.3 Project Objectives

The primary and secondary objectives of the FinWelfare project are as follows:

**Primary Objectives:**

1. **Centralised Fund Management** — Build a single platform where all donations are received, tracked, and disbursed, replacing fragmented spreadsheet and paper-based systems.

2. **Role-Based Access Control** — Implement three clearly separated roles (Admin, Donor, Beneficiary) with strictly enforced permissions so that each user can only access information and perform actions appropriate to their role.

3. **Automated Priority Scoring** — Develop a server-side scoring algorithm that objectively ranks beneficiary applications from 0 to 100 based on quantifiable factors (income, family size, urgency, document submission) without any possibility of manipulation.

4. **Atomic Fund Allocation** — Ensure that the approval of an application and the recording of the corresponding fund allocation transaction happen as a single atomic database operation, preventing partial updates or double-spending of funds.

5. **Secure Authentication** — Protect all user accounts with bcrypt-hashed passwords and JWT-based session management, with tokens expiring after 24 hours.

6. **API Security** — Protect all API endpoints against unauthorised access, brute-force login attempts, and excessive request rates using middleware and rate limiting.

**Secondary Objectives:**

7. **Donor Transparency** — Give donors a real-time view of total funds donated, total allocated, and currently available balance.

8. **Beneficiary Application Tracking** — Allow beneficiaries to track the status of their applications (pending, approved, rejected) and view the full details of each application they have submitted.

9. **Document Upload Support** — Allow beneficiaries to upload supporting documents (income proof, ID proof) securely with server-side file type and size validation.

10. **Responsive Web Interface** — Deliver a clean, mobile-friendly frontend interface that works across desktops, tablets, and smartphones without requiring any mobile app installation.

11. **Administrative Dashboard** — Provide administrators with comprehensive statistics including total users, total donations, pending and approved applications, total allocated funds, and available balance.

12. **Audit Trail** — Maintain a complete, immutable record of every donation and every fund allocation in a `transactions` table that can be queried for accountability and reporting.

---

## 1.4 Report Layout

This report is organised into eight chapters, each addressing a distinct phase of the software development lifecycle:

**Chapter 1 — Introduction:** Provides the background, problem statement, project objectives, and the overall layout of the report.

**Chapter 2 — Feasibility Study:** Examines the technical, operational, and economic feasibility of the project. Also lists all hardware and software requirements needed to develop and deploy the system.

**Chapter 3 — System Analysis:** Describes the methodology used to gather requirements, the chosen development methodology (Iterative/Incremental), the development model, deployment strategy, and the training and user support plan.

**Chapter 4 — System Design:** Covers the architectural design of the system including module descriptions, Data Flow Diagrams (0-Level and 1-Level), the Entity Relationship Diagram, and the complete API design with endpoint documentation.

**Chapter 5 — System Implementation:** Details the technology stack with justifications, explains the most significant portions of the source code, and provides annotated screenshots of each major screen in the application.

**Chapter 6 — System Testing:** Documents the testing strategy including unit testing, integration testing, and security testing. Provides detailed test case tables for all major modules and summarises the outcomes.

**Chapter 7 — Conclusion and Future Scope:** Summarises what was achieved, discusses the limitations of the current implementation, and presents a roadmap of features and enhancements that could be added in future versions.

**Chapter 8 — References:** Lists all books, research papers, articles, websites, and official documentation consulted during the development of this project.

---

---

# CHAPTER 2: FEASIBILITY STUDY

## 2.1 Technical Feasibility

Technical feasibility determines whether the organisation possesses or can acquire the technology, skills, and infrastructure necessary to successfully develop and operate the proposed system.

### 2.1.1 Technology Assessment

The FinWelfare system is built entirely on open-source, freely available technologies with massive community support and extensive documentation:

**Node.js Runtime Environment:** Node.js is a server-side JavaScript runtime built on Chrome's V8 engine. It uses an event-driven, non-blocking I/O model that makes it exceptionally efficient for handling concurrent HTTP requests — exactly the type of workload a web application like FinWelfare generates. Node.js has been in production at companies like LinkedIn, Netflix, and PayPal since 2009 and is one of the most battle-tested server runtimes available. Its non-blocking architecture means a single server instance can handle thousands of simultaneous connections without spawning a new thread for each one, making it highly resource-efficient.

**Express.js Framework:** Express.js is a minimal, un-opinionated web framework for Node.js. It provides a clean router, middleware pipeline, and request/response abstraction layer without imposing architectural constraints. Its middleware system allows clean separation of concerns: authentication, rate limiting, file upload handling, CORS, and error handling are all implemented as discrete, composable middleware functions. Express.js version 4.18.2 was used in this project.

**MySQL Relational Database:** MySQL is the world's most popular open-source relational database management system, maintained by Oracle Corporation. Its ACID-compliant transaction engine (InnoDB) guarantees data integrity for critical operations such as fund allocation. MySQL's support for foreign key constraints, JOIN queries, and aggregate functions makes it ideal for the financial data model used in FinWelfare. The `mysql2` npm package provides a modern, promise-based API for interacting with MySQL from Node.js.

**HTML5 / CSS3 / Vanilla JavaScript Frontend:** The client-side interface is built with standard web technologies without any JavaScript framework dependency. This decision was deliberate — it eliminates the need for a build step (e.g., webpack, Vite), reduces the deployment footprint, and makes the frontend immediately accessible on any web server that can serve static files. Google's Poppins font (served via CDN) is the only external frontend dependency.

**JSON Web Tokens (JWT):** JWT is an open standard (RFC 7519) for securely transmitting information between parties as a JSON object, digitally signed using HMAC-SHA256. It enables stateless authentication — the server does not need to maintain a session store. Each token encodes the user's ID, name, email, and role, and is verified on every API request.

**bcryptjs:** Password hashing uses the bcrypt adaptive hashing function with a salt factor of 10. Bcrypt is deliberately slow and computationally expensive, making offline brute-force attacks against stolen password hashes impractical. Unlike MD5 or SHA-256 (which are designed for speed), bcrypt's work factor can be increased as hardware becomes faster.

### 2.1.2 Skill Assessment

The development of FinWelfare requires proficiency in the following areas, all of which are standard computer science / information technology curriculum topics:

- JavaScript (ES6+) — for both backend (Node.js) and frontend
- SQL — for database schema design, queries, and stored procedure logic
- HTTP / REST API design principles
- HTML5 semantics and CSS3 layout
- Git version control
- Basic Linux / command line for server deployment

These skills are taught in every undergraduate computer science program and are readily acquirable through online resources such as MDN Web Docs, Node.js official documentation, and MySQL documentation.

### 2.1.3 Infrastructure Assessment

The system can be deployed on any server (physical or virtual) capable of running Node.js version 16 or higher and MySQL 8.0 or higher. This includes:

- **Cloud providers** (AWS EC2, Google Cloud Compute Engine, Azure VM, DigitalOcean Droplet) — starting from approximately ₹500–₹1,500/month for a basic VM
- **Shared hosting providers** that support Node.js (Heroku, Railway, Render — free tiers available for development)
- **Local on-premise server** — even a Raspberry Pi 4 is capable of running this application for a small organisation

**Verdict: Technically Feasible.** The required technologies are mature, open-source, extensively documented, and well within the skill set of a modern computer science graduate.

---

## 2.2 Operational Feasibility

Operational feasibility assesses whether the proposed system will work effectively within the organisation and be accepted by its users.

### 2.2.1 User Acceptance

The three user roles — Admin, Donor, and Beneficiary — have distinct but intuitive interfaces:

**Administrator:** The admin dashboard presents a clear statistics panel showing total users, donations, applications, and available funds. Applications are listed in priority order (highest priority first) with one-click Approve/Reject buttons. Any person comfortable with standard web interfaces (such as an office manager or NGO coordinator) can operate the admin panel without technical training.

**Donor:** The donor interface is deliberately simple. After login, donors see their contribution history and the total fund statistics. Submitting a new donation requires filling in just two fields: amount and an optional message. This interface is comparable in simplicity to online payment portals that millions of people use daily.

**Beneficiary:** The beneficiary application form collects structured information (income, family size, employment status, urgency, category, reason) that would be collected on any physical welfare application form. The digital version is less cumbersome than paper forms and eliminates errors caused by illegible handwriting.

### 2.2.2 Process Change Management

For organisations transitioning from paper-based or spreadsheet-based systems, FinWelfare introduces the following process changes:

- Donors contribute online instead of handing over cash/cheques in person
- Beneficiaries submit applications online instead of coming to an office
- Administrators review and act on applications through a web interface instead of reviewing physical files

These changes reduce administrative overhead, eliminate geographic barriers, and create an automatic audit trail. The resistance to change is expected to be low because the benefits (speed, transparency, accessibility) are immediately tangible.

### 2.2.3 Organisational Feasibility

FinWelfare requires a single administrator account for initial setup. After database initialisation (running the provided `schema.sql` file), the admin account is ready to use. No complex organisational restructuring is required.

**Verdict: Operationally Feasible.** The system is designed for non-technical users, the process changes are minimal and beneficial, and no organisational restructuring is required.

---

## 2.3 Economic Feasibility

Economic feasibility compares the costs of developing, deploying, and maintaining the system against the financial and non-financial benefits it delivers.

### 2.3.1 Development Costs

Since the project is developed as an academic exercise using entirely open-source tools, the monetary development cost is negligible:

| Cost Item | Amount |
|---|---|
| Node.js (open source) | ₹0 |
| MySQL Community Edition (open source) | ₹0 |
| Express.js and all npm packages (open source / MIT licence) | ₹0 |
| Development machine (already owned) | ₹0 |
| VS Code IDE (open source) | ₹0 |
| Git / GitHub (free tier) | ₹0 |
| **Total Development Cost** | **₹0** |

### 2.3.2 Deployment Costs

For a small to medium welfare organisation:

| Cost Item | Monthly Cost (Approx.) |
|---|---|
| Cloud VPS (e.g., DigitalOcean Basic Droplet, 1 vCPU, 1 GB RAM) | ₹800–₹1,200 |
| Domain name (annual, divided by 12) | ₹100–₹150 |
| SSL certificate (Let's Encrypt — free) | ₹0 |
| **Total Monthly Deployment Cost** | **₹900–₹1,350** |

For academic/demonstration purposes, free-tier cloud platforms (Render, Railway, Vercel + PlanetScale) can host the application at zero cost.

### 2.3.3 Benefits

The financial and non-financial benefits of FinWelfare far outweigh its minimal costs:

**Quantifiable Benefits:**
- Elimination of paper and printing costs associated with physical application forms (estimated ₹5,000–₹15,000/year for an active NGO)
- Reduction in administrative labour hours spent manually sorting, filing, and tracking applications
- Prevention of duplicate payments (enforced by the transactions audit table)
- Reduced risk of fund misappropriation due to complete audit trail

**Non-Quantifiable Benefits:**
- Increased donor confidence due to financial transparency
- Faster response times for critical beneficiary applications (priority scoring ensures critical cases are reviewed first)
- Improved organisational reputation through demonstrated use of modern technology
- Accessible from anywhere — eliminates geographic barriers for both donors and beneficiaries

### 2.3.4 Cost-Benefit Summary

The cost of deploying FinWelfare (approximately ₹1,000–₹1,500/month) is a fraction of the cost of employing even a part-time administrative assistant to manage the equivalent workload manually. The platform pays for itself many times over in labour savings alone.

**Verdict: Economically Feasible.** Development cost is zero (open-source stack), deployment cost is minimal, and the operational benefits are substantial.

---

## 2.4 System Requirements

### 2.4.1 Hardware Requirements

#### Development Machine (Minimum)

| Component | Requirement |
|---|---|
| Processor | Intel Core i3 / AMD Ryzen 3 or equivalent (1.5 GHz or higher) |
| RAM | 4 GB (8 GB recommended for smooth multi-tabbed development) |
| Storage | 10 GB free disk space |
| Display | 1024 × 768 resolution or higher |
| Network | Broadband internet connection (for npm package downloads) |

#### Production Server (Minimum for small organisation)

| Component | Requirement |
|---|---|
| Processor | 1 vCPU (cloud) / Intel Core i3 equivalent |
| RAM | 1 GB (2 GB recommended) |
| Storage | 20 GB SSD (for OS, application, database, and uploaded documents) |
| Bandwidth | 100 Mbps |
| OS | Ubuntu 20.04 LTS or later (or any Linux distribution) |

#### Client Device (End User)

| Component | Requirement |
|---|---|
| Device | Any device with a modern web browser |
| Browser | Google Chrome 90+, Mozilla Firefox 85+, Microsoft Edge 90+, Safari 14+ |
| Screen | 360px minimum width (responsive design supports mobile) |
| Network | Any internet connection |

---

### 2.4.2 Software Requirements

#### Development Environment

| Software | Version Used | Purpose |
|---|---|---|
| Node.js | v18.x LTS | JavaScript runtime for backend |
| npm | v9.x | Package manager |
| MySQL | 8.0 | Relational database |
| MySQL Workbench / DBeaver | Latest | Database GUI (optional) |
| Visual Studio Code | Latest | Source code editor |
| Git | Latest | Version control |
| Postman / Thunder Client | Latest | API testing |
| Web Browser (Chrome/Firefox) | Latest | Frontend testing |

#### npm Dependencies (Production)

| Package | Version | Purpose |
|---|---|---|
| express | ^4.18.2 | Web framework |
| mysql2 | ^3.2.0 | MySQL driver (promise-based) |
| jsonwebtoken | ^9.0.0 | JWT generation and verification |
| bcryptjs | ^2.4.3 | Password hashing |
| dotenv | ^16.0.3 | Environment variable management |
| cors | ^2.8.5 | Cross-Origin Resource Sharing headers |
| multer | ^2.1.1 | Multipart form file uploads |
| express-rate-limit | ^8.3.1 | API rate limiting |

#### npm Dependencies (Development Only)

| Package | Version | Purpose |
|---|---|---|
| nodemon | ^3.1.14 | Auto-restart server on file changes |

---

---

# CHAPTER 3: SYSTEM ANALYSIS

## 3.1 Methodology

System analysis is the process of studying and understanding an existing problem domain in sufficient depth to design a software solution that addresses it effectively. For FinWelfare, the analysis phase involved the following activities:

### 3.1.1 Problem Domain Research

The team studied the operational challenges faced by welfare organisations in managing donations and disbursements. Key pain points identified through literature review and informal interviews with NGO staff included:

- **Inefficiency in application processing:** Physical applications take days or weeks to process due to manual sorting and filing.
- **Lack of priority framework:** Without objective criteria, reviewers must rely on subjective judgement when deciding which applications to approve first.
- **Financial opacity:** Donors have no way to verify that their contributions are being used appropriately.
- **No audit trail:** Without a transaction log, it is impossible to reconstruct the financial history of a welfare fund.

### 3.1.2 Requirements Gathering

Requirements were gathered through the following techniques:

**Document Analysis:** Existing paper-based application forms used by welfare organisations were analysed to identify all data fields needed in the digital application form. This confirmed the need for fields such as monthly income, family members, employment status, urgency category, and document uploads.

**Comparative Analysis:** Similar platforms (GiveIndia, Ketto, Milaap) were studied to identify best practices in donor interfaces, beneficiary dashboards, and administrative controls.

**Use Case Modelling:** Use cases were developed for each of the three user roles, identifying all system interactions. A total of 15 primary use cases were identified:

- **Admin:** Login, View Dashboard, View All Applications, Approve Application, Reject Application, View All Donations, View All Users
- **Donor:** Register, Login, Submit Donation, View Donation History, View Fund Statistics
- **Beneficiary:** Register, Login, Submit Application, View Application Status

### 3.1.3 Functional Requirements

1. The system shall allow users to register with name, email, password, and role (donor/beneficiary).
2. The system shall authenticate users via email and password, issuing a 24-hour JWT upon successful login.
3. Donors shall be able to submit donations with an amount (required) and message (optional).
4. Beneficiaries shall be able to submit applications for financial assistance, including personal details and uploaded documents.
5. The system shall automatically calculate a priority score (0–100) for each application server-side.
6. Administrators shall be able to view all applications sorted by priority score (highest first).
7. Administrators shall be able to approve or reject any pending application.
8. Approval of an application shall atomically update the application status and record a transaction.
9. The system shall prevent approval of an application if available funds are insufficient.
10. An admin dashboard shall display aggregate statistics in real time.

### 3.1.4 Non-Functional Requirements

1. **Security:** All passwords shall be hashed using bcrypt. All API endpoints (except register and login) shall require a valid JWT. Role-based access control shall be enforced on every protected route.
2. **Performance:** The server shall handle at least 200 API requests per 15 minutes per IP without degradation.
3. **Availability:** The system shall be deployable on widely available cloud infrastructure with 99.9% uptime SLA.
4. **Scalability:** The MySQL database schema shall support at least 100,000 users, 1,000,000 donations, and 500,000 applications without structural changes.
5. **Usability:** All interfaces shall be responsive and usable on mobile devices with screen widths as small as 360px.
6. **Auditability:** Every financial transaction (donation or allocation) shall be permanently recorded in the `transactions` table.

---

## 3.2 Development Methodology

FinWelfare was developed using an **Iterative and Incremental Development** methodology. This approach divides the project into a series of short development cycles (iterations), each of which produces a working increment of the system that is refined in subsequent iterations.

### Why Iterative Development?

For a web application with three distinct user roles and complex cross-cutting concerns (security, database integrity, file uploads), iterative development was preferred over a pure Waterfall model for the following reasons:

- **Early validation:** Each iteration produces a runnable system that can be demonstrated and tested. This prevents the discovery of fundamental flaws only at the end of the project.
- **Flexibility:** Requirements for a social welfare platform can evolve as stakeholder feedback is incorporated. Iterative development accommodates this naturally.
- **Risk mitigation:** High-risk features (JWT authentication, atomic database transactions) were implemented in early iterations, reducing the risk of last-minute surprises.
- **Incremental testing:** Each new feature is tested immediately after implementation, making defect isolation straightforward.

### Iterations Overview

**Iteration 1 — Foundation:** Database schema design and initialisation, Express server setup, environment configuration, basic CORS and JSON middleware, health check endpoint.

**Iteration 2 — Authentication:** User registration and login endpoints, bcrypt password hashing, JWT generation and verification middleware, role-based authorisation middleware.

**Iteration 3 — Donation Module:** Donor donation submission, donation history retrieval, total fund statistics calculation.

**Iteration 4 — Application Module:** Beneficiary application submission with file upload support, priority score calculation algorithm, application status tracking.

**Iteration 5 — Admin Module:** Admin dashboard statistics, application listing with priority sorting, approve/reject with atomic fund allocation, user and donation management.

**Iteration 6 — Frontend:** HTML/CSS/JS pages for landing, login, registration, donor dashboard, beneficiary dashboard, and admin dashboard, all wired to the backend API.

**Iteration 7 — Security Hardening:** Rate limiting on auth and general API routes, file type and size validation for uploads, JWT_SECRET validation on startup, input sanitisation, proper HTTP status codes.

**Iteration 8 — Testing and Documentation:** Comprehensive API testing, edge case handling, README and inline code documentation.

---

## 3.3 Development Model

The **Iterative model** (as described in Section 3.2) was the primary development model. Within each iteration, a mini-Waterfall sub-process was followed:

1. **Plan** — Define the scope and objectives of the iteration.
2. **Design** — Design the database tables, API endpoints, and frontend components needed.
3. **Implement** — Write the code.
4. **Test** — Test the implemented functionality manually using Postman/browser.
5. **Review** — Evaluate the output, identify issues, and feed learnings into the next iteration.

This model aligns with agile development principles while remaining structured enough for an academic project with defined deliverables.

---

## 3.4 Deployment

FinWelfare is designed for straightforward deployment on any modern Linux server. The deployment process consists of the following steps:

### Step 1: Server Provisioning
Provision a Linux server (Ubuntu 20.04 LTS recommended) on a cloud provider such as DigitalOcean, AWS EC2, or Google Cloud. Minimum specifications: 1 vCPU, 1 GB RAM, 20 GB SSD.

### Step 2: Install Dependencies
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MySQL 8.0
sudo apt install -y mysql-server
sudo mysql_secure_installation

# Install PM2 (process manager for Node.js)
sudo npm install -g pm2
```

### Step 3: Database Initialisation
```bash
# Log in to MySQL and run the schema
mysql -u root -p < database/schema.sql
```

### Step 4: Application Configuration
```bash
# Clone the repository
git clone <repository-url>
cd financial_resourse_managment_for_social-_wlefare/backend

# Install npm packages
npm install

# Configure environment
cp .env.example .env
nano .env   # Set DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET, PORT
```

### Step 5: Start the Application
```bash
# Start with PM2 for production (auto-restart on crash)
pm2 start server.js --name finwelfare
pm2 startup
pm2 save
```

### Step 6: Reverse Proxy (Optional but Recommended)
Configure Nginx as a reverse proxy to serve FinWelfare on port 80/443, with an SSL certificate obtained from Let's Encrypt (free) using Certbot.

---

## 3.5 Training and User Support

### 3.5.1 Admin Training

The administrator requires the most training since they have access to all system features. Recommended training areas:

- **Dashboard reading:** Understanding the statistics cards (total donations, available funds, pending applications).
- **Application review workflow:** Viewing priority-sorted applications, reading the score breakdown, approving or rejecting with appropriate notes.
- **Fund management:** Understanding the relationship between total donations, allocated funds, and available balance.
- **User management:** Viewing all registered users.

Estimated training time: **2 hours** (one hands-on session with a live demonstration).

### 3.5.2 Donor Training

Donor interactions with the system are minimal and intuitive:

- Registering an account
- Logging in and submitting a donation
- Viewing donation history

Estimated training time: **15–30 minutes** (self-service with in-app hints).

### 3.5.3 Beneficiary Training

Beneficiaries need to understand:

- How to register and log in
- How to correctly fill in the application form (especially the financial fields)
- How to upload supporting documents
- How to interpret their application status (pending / approved / rejected)

Estimated training time: **30–45 minutes** (one guided walkthrough).

### 3.5.4 Documentation and Support

All user-facing pages include contextual labels and placeholder text. A user guide (PDF) can be prepared and attached to the system's About page. For ongoing support, the administrator can be contacted via the organisation's existing communication channels.

---

---

# CHAPTER 4: SYSTEM DESIGN

## 4.1 Module Description

FinWelfare is organised into five primary modules, each with clearly defined responsibilities and well-defined interfaces between them.

### Figure 4.1.1 — System Architecture Overview

```
┌────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                        │
│   ┌──────────┐  ┌────────────┐  ┌──────────┐  ┌───────────┐   │
│   │index.html│  │ login.html │  │donor.html│  │admin.html │   │
│   │(Landing) │  │(Auth Page) │  │(Donor UI)│  │(Admin UI) │   │
│   └────┬─────┘  └─────┬──────┘  └────┬─────┘  └─────┬─────┘   │
│        │              │              │               │          │
│        └──────────────┴──────────────┴───────────────┘          │
│                               │  HTTPS / REST API               │
└───────────────────────────────┼────────────────────────────────┘
                                │
┌───────────────────────────────▼────────────────────────────────┐
│                    BACKEND (Node.js + Express.js)               │
│  ┌─────────────┐  ┌────────────────┐  ┌─────────────────────┐  │
│  │  Auth       │  │  Rate Limiter  │  │  Static File Server │  │
│  │  Middleware │  │  Middleware    │  │  (/frontend,        │  │
│  │  (JWT)      │  │  (express-RL)  │  │   /uploads)         │  │
│  └──────┬──────┘  └───────┬────────┘  └─────────────────────┘  │
│         │                 │                                      │
│  ┌──────▼─────────────────▼──────────────────────────────────┐  │
│  │                      ROUTER LAYER                          │  │
│  │  /api/auth   /api/donations  /api/applications  /api/admin │  │
│  └──────┬──────────────┬────────────────┬──────────────┬──────┘  │
│         │              │                │              │          │
│  ┌──────▼──────┐ ┌─────▼──────┐ ┌──────▼──────┐ ┌────▼──────┐  │
│  │    Auth     │ │  Donation  │ │ Application │ │   Admin   │  │
│  │ Controller  │ │ Controller │ │ Controller  │ │Controller │  │
│  └──────┬──────┘ └─────┬──────┘ └──────┬──────┘ └────┬──────┘  │
└─────────┼──────────────┼───────────────┼──────────────┼─────────┘
          │              │               │              │
┌─────────▼──────────────▼───────────────▼──────────────▼─────────┐
│                    DATABASE LAYER (MySQL 8.0)                    │
│   ┌──────────┐  ┌───────────┐  ┌──────────────┐  ┌──────────┐   │
│   │  users   │  │ donations │  │ applications │  │transact- │   │
│   │  table   │  │  table    │  │    table     │  │ions table│   │
│   └──────────┘  └───────────┘  └──────────────┘  └──────────┘   │
└────────────────────────────────────────────────────────────────┘
```

### 4.1.1 Authentication Module

**Purpose:** Handles all user identity management — registration and login.

**Components:**
- `routes/auth.js` — Defines two endpoints: `POST /api/auth/register` and `POST /api/auth/login`
- `controllers/authController.js` — Implements register (validates input, checks duplicate email, hashes password, inserts user) and login (validates credentials, compares bcrypt hash, signs JWT)
- `middleware/auth.js` — `authenticate` middleware (verifies JWT and attaches `req.user`) and `authorize` middleware factory (enforces role-based access)

**Key Security Measures:**
- Passwords are never stored in plain text; bcrypt salt rounds = 10
- Duplicate email check prevents account enumeration
- JWT payload contains: `{ id, name, email, role }` with 24-hour expiry
- Auth endpoints are subject to a strict rate limiter: 20 requests per 15 minutes per IP

---

### 4.1.2 Donation Module

**Purpose:** Manages all financial contributions made by donors.

**Components:**
- `routes/donations.js` — Defines endpoints for submitting a donation, viewing donation history, and retrieving fund totals
- `controllers/donationController.js` — Implements `addDonation` (records new donation), `getMyDonations` (returns donor's history), `getTotalFunds` (aggregates total donated, allocated, and available)

**Business Rules:**
- Only authenticated users with role `donor` can submit donations
- Donation amount must be greater than zero
- Available funds = `SUM(donations.amount)` − `SUM(transactions.amount WHERE type='allocation')`

---

### 4.1.3 Application Module

**Purpose:** Manages beneficiary requests for financial assistance, including the priority scoring engine.

**Components:**
- `routes/applications.js` — Defines endpoints for submitting, listing, and viewing applications
- `controllers/applicationController.js` — Implements `applyForFunds` (validates input, collects uploaded files, calculates priority score, inserts application), `getMyApplications` (returns beneficiary's applications), `getApplicationDetails` (returns single application with reviewer info)

**Priority Scoring Algorithm:**

The server-side priority scoring engine is the most critical business logic component. It calculates a score from 0 to 100 based on four factors:

| Factor | Condition | Points |
|---|---|---|
| Monthly Income | < $10,000 | +30 |
| Monthly Income | $10,000 – $19,999 | +20 |
| Monthly Income | $20,000 – $29,999 | +10 |
| Monthly Income | ≥ $30,000 | +0 |
| Family Members | > 5 | +20 |
| Family Members | > 3 (and ≤ 5) | +10 |
| Family Members | ≤ 3 | +0 |
| Urgency | Critical | +30 |
| Urgency | High | +20 |
| Urgency | Medium | +10 |
| Urgency | Low | +5 |
| Documents Uploaded | Yes (at least one file) | +20 |
| Documents Uploaded | No | +0 |
| **Maximum Possible Score** | | **100** |

Priority Level derived from score:
- Score ≥ 60 → **High**
- Score 30–59 → **Medium**
- Score < 30 → **Low**

The score is calculated entirely on the server after form submission. The beneficiary cannot see or influence their score.

---

### 4.1.4 Admin Module

**Purpose:** Provides administrative control over all platform operations.

**Components:**
- `routes/admin.js` — Defines all admin endpoints, all protected by `authenticate` + `authorize('admin')` middleware chain
- `controllers/adminController.js` — Implements all admin operations

**Admin Operations:**
- `GET /api/admin/stats` — Dashboard statistics (total users, donations, applications, allocated, available)
- `GET /api/admin/applications` — All applications sorted by priority_score DESC with score breakdown
- `PUT /api/admin/applications/:id/approve` — Atomic approval: verifies funds available, updates status, records transaction
- `PUT /api/admin/applications/:id/reject` — Marks application as rejected with reviewer info
- `GET /api/admin/donations` — All donations with donor information
- `GET /api/admin/users` — All registered users (password excluded)

**Atomic Fund Allocation:** The `approveApplication` controller uses a MySQL transaction:
1. `BEGIN TRANSACTION`
2. Check application status is 'pending'
3. Calculate available funds
4. Verify sufficient funds available
5. `UPDATE applications SET status='approved', amount_allocated=..., reviewed_by=..., reviewed_at=NOW()`
6. `INSERT INTO transactions (application_id, beneficiary_id, amount, type='allocation')`
7. `COMMIT`
If any step fails, the entire transaction is rolled back.

---

### 4.1.5 File Upload Module

**Purpose:** Handles secure storage of supporting documents uploaded by beneficiaries.

**Components:**
- Multer configuration in `server.js`
- Uploads stored in `/uploads/` directory (outside the frontend static root)
- Files served via `express.static` at `/uploads`

**Security Measures:**
- Allowed MIME types: `image/jpeg`, `image/png`, `image/gif`, `application/pdf`
- Maximum file size: 5 MB per file
- Filenames are randomised (`{timestamp}-{random}{ext}`) to prevent path traversal attacks
- File paths stored as JSON array in `applications.documents_path`

---

### Figure 4.1.2 — Module Interaction Diagram

```
              ┌──────────┐
              │  Client  │
              └────┬─────┘
                   │ HTTP Request + JWT Bearer Token
       ┌───────────▼──────────────────────────────┐
       │          authenticate middleware           │
       │    (verify JWT → attach req.user)         │
       └───────────┬──────────────────────────────┘
                   │
       ┌───────────▼──────────────────────────────┐
       │           authorize middleware             │
       │  (check req.user.role against allowed)    │
       └───┬──────────┬────────────────┬──────────┘
           │          │                │
    ┌──────▼───┐ ┌────▼────┐ ┌────────▼────────┐
    │ Donation │ │ Applic- │ │      Admin      │
    │ Module   │ │ ation   │ │     Module      │
    │          │ │ Module  │ │                 │
    └──────┬───┘ └────┬────┘ └────────┬────────┘
           │          │               │
           └──────────┴───────────────┘
                       │
              ┌────────▼────────┐
              │  MySQL Database  │
              └─────────────────┘
```

---

## 4.2 Data Flow Diagram

Data Flow Diagrams (DFDs) represent how data moves through the system — from external entities (users) through processes and data stores. They use four symbols:
- **Rectangle** — External entity (user, administrator, donor)
- **Rounded rectangle / bubble** — Process (function performed on data)
- **Open rectangle (two parallel lines)** — Data store (database table)
- **Arrow** — Data flow

---

### 4.2.1 0 Level DFD (Context Diagram)

The Context Diagram (Level 0) shows the system as a single process interacting with external entities.

```
                    Registration Data
          ┌──────────────────────────────────┐
          │                                  ▼
  ┌───────┴──────┐             ┌─────────────────────────┐
  │    DONOR     │ Donation    │                         │
  │   (External  ├────────────►│                         │
  │    Entity)   │ Data        │    FINANCIAL RESOURCE   │
  └──────────────┘             │     MANAGEMENT FOR      │
                               │     SOCIAL WELFARE      │  Fund Statistics
  ┌──────────────┐             │        SYSTEM           ├──────────────────►
  │ BENEFICIARY  │ Application │       (FinWelfare)      │
  │   (External  ├────────────►│                         │
  │    Entity)   │ Data        │                         │ Application Status
  └──────────────┘             │                         ├──────────────────►
                               │                         │
  ┌──────────────┐             │                         │ Admin Reports
  │    ADMIN     │ Review      │                         ├──────────────────►
  │   (External  ├────────────►│                         │
  │    Entity)   │ Decisions   │                         │
  └──────────────┘             └─────────────────────────┘
```

**Explanation:**
- The **Donor** sends registration data and donation contributions to the system and receives fund statistics in return.
- The **Beneficiary** sends registration data and financial assistance applications to the system and receives application status updates in return.
- The **Admin** sends review decisions (approve/reject) to the system and receives comprehensive administrative reports and statistics in return.

---

### 4.2.2 1 Level DFD

The Level 1 DFD expands the single process into its constituent sub-processes, showing the internal data flows.

```
DONOR──────────►[1.0 REGISTER/LOGIN]──────────────────►[D1: USERS TABLE]
BENEFICIARY────►[1.0 REGISTER/LOGIN]
ADMIN──────────►[1.0 REGISTER/LOGIN]

                [1.0]───JWT Token──────────────────────►[2.0 MANAGE DONATIONS]
                                                         [3.0 MANAGE APPLICATIONS]
                                                         [4.0 ADMIN OPERATIONS]

DONOR──────────►[2.0 MANAGE DONATIONS]
                [2.0]───Donation Record──────────────────►[D2: DONATIONS TABLE]
                [2.0]───Fund Stats────────────────────────►DONOR

BENEFICIARY────►[3.0 MANAGE APPLICATIONS]
                [3.0]───Priority Score Calculation
                [3.0]───Application Record───────────────►[D3: APPLICATIONS TABLE]
                [3.0]───Document Files──────────────────►[D5: FILE STORAGE]
                [3.0]───Application Status──────────────►BENEFICIARY

ADMIN──────────►[4.0 ADMIN OPERATIONS]
                [4.0]◄──All Applications─────────────────[D3: APPLICATIONS TABLE]
                [4.0]───Approve/Reject Decision──────────►[D3: APPLICATIONS TABLE]
                [4.0]───Fund Allocation (Atomic TX)
                        [4.0]──Transaction Record────────►[D4: TRANSACTIONS TABLE]
                [4.0]───Dashboard Stats─────────────────►ADMIN
                [4.0]◄──Donation History──────────────────[D2: DONATIONS TABLE]
                [4.0]◄──User List─────────────────────────[D1: USERS TABLE]

D1: USERS TABLE
D2: DONATIONS TABLE
D3: APPLICATIONS TABLE
D4: TRANSACTIONS TABLE
D5: FILE STORAGE (./uploads/)
```

---

## 4.3 Entity Relationship (ER) Diagram

### 4.3.1 ER Diagram Description

The FinWelfare database consists of four tables with the following relationships:

```
USERS (id PK, name, email UK, password, role, created_at)
  │
  │ 1:N  (one donor makes many donations)
  ▼
DONATIONS (id PK, donor_id FK→users.id, amount, message, created_at)

USERS (id PK ...)
  │
  │ 1:N  (one beneficiary submits many applications)
  ▼
APPLICATIONS (id PK, beneficiary_id FK→users.id, phone, address,
              income, family_members, employment_status, amount,
              category, reason, urgency, documents_path,
              priority_score, priority_level, status,
              amount_allocated, reviewed_by FK→users.id,
              reviewed_at, created_at)

APPLICATIONS (id PK ...)
  │
  │ 1:N  (one approved application generates allocation transactions)
  ▼
TRANSACTIONS (id PK, application_id FK→applications.id,
              beneficiary_id FK→users.id, amount, type, created_at)
```

### 4.3.2 Table Descriptions

**Table 4.2 — Database Tables Overview**

| Table | Primary Key | Foreign Keys | Purpose |
|---|---|---|---|
| `users` | `id` | — | Stores all system users (admin, donor, beneficiary) |
| `donations` | `id` | `donor_id → users.id` | Records all monetary contributions |
| `applications` | `id` | `beneficiary_id → users.id`, `reviewed_by → users.id` | Stores financial assistance requests with priority data |
| `transactions` | `id` | `application_id → applications.id`, `beneficiary_id → users.id` | Immutable audit log of all fund movements |

### 4.3.3 Relationship Summary

| Relationship | Type | Description |
|---|---|---|
| USERS → DONATIONS | One-to-Many | A donor can make multiple donations |
| USERS → APPLICATIONS (as beneficiary) | One-to-Many | A beneficiary can submit multiple applications |
| USERS → APPLICATIONS (as reviewer) | One-to-Many | An admin can review multiple applications |
| USERS → TRANSACTIONS | One-to-Many | A beneficiary can receive multiple fund allocations |
| APPLICATIONS → TRANSACTIONS | One-to-Many | An approved application creates an allocation transaction |

---

## 4.4 API Design

FinWelfare follows RESTful API design principles. All endpoints accept and return JSON. File upload endpoints accept `multipart/form-data`.

### Table 4.3 — API Endpoints

| Method | Endpoint | Auth Required | Role | Description |
|---|---|---|---|---|
| POST | `/api/auth/register` | No | Any | Register new user (donor/beneficiary) |
| POST | `/api/auth/login` | No | Any | Login and receive JWT |
| POST | `/api/donations` | Yes | donor | Submit a new donation |
| GET | `/api/donations` | Yes | donor | Get own donation history |
| GET | `/api/donations/total` | Yes | donor, admin | Get fund totals |
| POST | `/api/applications` | Yes | beneficiary | Submit application (multipart) |
| GET | `/api/applications` | Yes | beneficiary | Get own applications |
| GET | `/api/applications/:id` | Yes | beneficiary, admin | Get application details |
| GET | `/api/admin/stats` | Yes | admin | Dashboard statistics |
| GET | `/api/admin/applications` | Yes | admin | All applications (priority sorted) |
| PUT | `/api/admin/applications/:id/approve` | Yes | admin | Approve application |
| PUT | `/api/admin/applications/:id/reject` | Yes | admin | Reject application |
| GET | `/api/admin/donations` | Yes | admin | All donations with donor info |
| GET | `/api/admin/users` | Yes | admin | All users |
| GET | `/api/health` | No | Any | Server health check |

### Authentication Header Format

All protected endpoints require the `Authorization` header:
```
Authorization: Bearer <jwt_token>
```

### Standard Response Format

**Success:**
```json
{ "message": "Operation successful", "data": { ... } }
```

**Error:**
```json
{ "message": "Error description" }
```

---

---

# CHAPTER 5: SYSTEM IMPLEMENTATION

## 5.1 Express.js

Express.js is the core web framework used in FinWelfare. Developed in 2010 by T.J. Holowaychuk and currently maintained by the OpenJS Foundation, Express.js version 4.x is one of the most downloaded npm packages of all time, with over 30 million weekly downloads.

### Why Express.js?

**Minimalism:** Express provides only what is essential — a router, request/response abstraction, and a middleware pipeline. It imposes no structure on how you organise your code, giving developers full control over architecture.

**Middleware Architecture:** The middleware concept is central to Express.js and is one of its most powerful features. A middleware function is simply a function that has access to the request object (`req`), the response object (`res`), and the `next` middleware function. In FinWelfare, the following middleware are used:

1. `cors()` — Adds Cross-Origin Resource Sharing headers, allowing the frontend to communicate with the API
2. `express.json()` — Parses incoming JSON request bodies
3. `express.static()` — Serves the frontend HTML/CSS/JS files and uploaded documents
4. `authLimiter` / `apiLimiter` — Rate limiters that count requests per IP
5. `authenticate` — Verifies the JWT Bearer token and attaches the decoded user to `req.user`
6. `authorize(...roles)` — Checks that the authenticated user's role is in the allowed list
7. `upload.fields(...)` — Multer middleware for parsing multipart form data and saving files
8. Global error handler — Catches unhandled errors and returns a 500 response

**Routing:** Express's `Router` class allows routes to be defined in separate files (`routes/auth.js`, `routes/donations.js`, etc.) and mounted under a base path (`/api/auth`, `/api/donations`, etc.). This keeps the main `server.js` clean and the route files focused.

### Express.js Configuration in FinWelfare

```javascript
const express = require('express');
const app = express();

// Middleware pipeline
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/uploads', express.static(UPLOADS_DIR));

// Route mounting with rate limiters
app.use('/api/auth',         authLimiter, require('./routes/auth'));
app.use('/api/donations',    apiLimiter,  require('./routes/donations'));
app.use('/api/applications', apiLimiter,  require('./routes/applications'));
app.use('/api/admin',        apiLimiter,  require('./routes/admin'));
```

---

## 5.2 Node.js

Node.js is the runtime environment that executes JavaScript on the server side. It was created by Ryan Dahl in 2009 and is built on Chrome's V8 JavaScript engine — the same engine that powers Google Chrome.

### Key Characteristics Relevant to FinWelfare

**Event Loop & Non-Blocking I/O:** Node.js uses a single-threaded event loop combined with asynchronous, non-blocking I/O operations. When a database query is executed, Node.js does not block and wait for the result — it registers a callback and continues processing other requests. This makes Node.js exceptionally efficient for I/O-bound applications like web APIs, which spend most of their time waiting for database responses.

**Async/Await:** FinWelfare uses modern `async/await` syntax throughout all controller functions. This makes asynchronous code readable and linear while still being non-blocking:

```javascript
const login = async (req, res) => {
  const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
  const isMatch = await bcrypt.compare(password, users[0].password);
  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET);
  res.json({ token });
};
```

**npm Ecosystem:** Node.js's package manager (npm) provides access to over 2 million open-source packages. Every backend dependency in FinWelfare (express, mysql2, bcryptjs, jsonwebtoken, multer, express-rate-limit, dotenv) is available on npm and installable with a single command.

**Environment Variables:** FinWelfare uses `dotenv` to load environment variables from a `.env` file. This separates configuration (database credentials, JWT secret, port) from code, making it easy to deploy in different environments (development, staging, production) without changing source files.

---

## 5.3 MySQL

MySQL is the relational database management system used in FinWelfare. The `mysql2` npm package (version 3.2.0) provides the database driver, offering both callback-based and Promise-based APIs. FinWelfare uses the Promise-based API exclusively for consistency with `async/await`.

### Database Connection Pool

```javascript
// backend/config/db.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'financial_welfare',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
```

A **connection pool** is used instead of a single connection. Pooling maintains a set of pre-established database connections (up to 10 in this configuration) that can be reused across requests. This eliminates the overhead of creating a new database connection for every HTTP request.

### Relational Integrity

All foreign key relationships in the FinWelfare schema are enforced at the database level using `FOREIGN KEY` constraints with the InnoDB storage engine. This guarantees:

- A donation cannot reference a non-existent donor
- An application cannot reference a non-existent beneficiary
- A transaction cannot reference a non-existent application or beneficiary
- A reviewer on an application must be an existing user

### Atomic Transactions

The `approveApplication` admin function uses a MySQL transaction to ensure that the application status update and the transaction record insertion happen atomically:

```javascript
const connection = await db.getConnection();
await connection.beginTransaction();
try {
  // 1. Lock and read the application
  // 2. Check funds available
  // 3. Update application status
  // 4. Insert transaction record
  await connection.commit();
} catch (err) {
  await connection.rollback();
  throw err;
} finally {
  connection.release();
}
```

This pattern guarantees that it is **impossible** for an application to be marked "approved" without a corresponding transaction record, or for a transaction to be created for an application that was not properly approved.

---

## 5.4 JSON Web Token (JWT)

JWT (JSON Web Token) is an open standard (RFC 7519) used in FinWelfare for stateless authentication. It was chosen over server-side sessions because it requires no session store (eliminating a shared-state dependency that complicates horizontal scaling).

### JWT Structure

A JWT consists of three Base64URL-encoded parts separated by dots:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9   ← Header
.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkB3...    ← Payload
.SflKxwRJSMeKKF2QT4fwpMeJf36POk6...    ← Signature
```

**Header:** `{ "alg": "HS256", "typ": "JWT" }` — specifies HMAC-SHA256 algorithm
**Payload:** `{ "id": 1, "name": "Admin", "email": "admin@welfare.org", "role": "admin", "iat": 1234567890, "exp": 1234654290 }`
**Signature:** `HMACSHA256(base64(header) + "." + base64(payload), JWT_SECRET)`

### JWT in FinWelfare

**Issuance (on login):**
```javascript
const token = jwt.sign(
  { id: user.id, name: user.name, email: user.email, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);
```

**Verification (on every protected request):**
```javascript
const authenticate = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access token required' });
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = decoded;  // { id, name, email, role }
  next();
};
```

**Role Enforcement:**
```javascript
const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role))
    return res.status(403).json({ message: 'Access forbidden' });
  next();
};
```

The `JWT_SECRET` is a long random string stored in the `.env` file. In production, if `JWT_SECRET` is not set, the server refuses to start (preventing insecure deployments).

---

## 5.5 Multer (File Upload)

Multer is an Express middleware for handling `multipart/form-data` requests — the encoding type used for HTML forms that include file inputs. FinWelfare uses Multer to handle supporting document uploads from beneficiaries.

### Configuration

```javascript
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${unique}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Only PDF, JPEG, PNG, and GIF files are allowed'), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
```

Key security decisions:
- **Randomised filenames:** Prevents attackers from predicting file paths
- **MIME type whitelist:** Prevents uploading executable scripts disguised as documents
- **5 MB size limit:** Prevents denial-of-service through large file uploads

---

## 5.6 bcryptjs (Password Hashing)

bcrypt is a password hashing function designed specifically for long-term security against offline brute-force attacks. Unlike general-purpose cryptographic hash functions (MD5, SHA-256), bcrypt is intentionally slow due to its key-stretching approach.

### How bcrypt Works

1. A random 128-bit **salt** is generated for each password
2. The password and salt are run through the Blowfish cipher a configurable number of times (2^cost_factor iterations)
3. The cost factor (salt rounds) in FinWelfare is set to **10**, meaning 2^10 = 1,024 iterations
4. The output is a 60-character string containing the cost factor, salt, and hash

Example hash: `$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy`

### Usage in FinWelfare

```javascript
// On registration — hash the password
const hashedPassword = await bcrypt.hash(password, 10);

// On login — compare provided password against stored hash
const isMatch = await bcrypt.compare(providedPassword, storedHash);
```

At cost factor 10 on modern hardware, bcrypt takes approximately 100ms per hash. This makes online brute-force attacks (rate-limited to 20/15min per IP) effectively impossible, and offline attacks against a stolen database implausibly slow.

---

## 5.7 Code

### 5.7.1 Server Entry Point (`backend/server.js`)

The `server.js` file is the application entry point. It:
1. Validates that `JWT_SECRET` is set (exits in production if missing, generates a random one in development)
2. Creates the uploads directory if it does not exist
3. Configures Multer storage with randomised filenames and MIME type filtering
4. Defines two rate limiters: strict (20 req/15min for auth) and general (200 req/15min for APIs)
5. Mounts all middleware and route handlers
6. Starts the HTTP server and verifies the database connection

```javascript
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Environment validation
if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ FATAL: JWT_SECRET environment variable is required in production.');
    process.exit(1);
  }
  const crypto = require('crypto');
  process.env.JWT_SECRET = crypto.randomBytes(32).toString('hex');
  console.warn('⚠️  JWT_SECRET not set – using random development secret.');
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware and routes setup...
app.listen(PORT, async () => {
  console.log(`✅ Server running on port ${PORT}`);
  await db.query('SELECT 1');  // Verify DB connection
  console.log('✅ Database connection OK');
});
```

---

### 5.7.2 Priority Score Calculator (`backend/controllers/applicationController.js`)

The priority scoring function is the core business logic of the application:

```javascript
function calculatePriorityScore({ income, family_members, urgency, hasDocuments }) {
  let score = 0;

  // Income factor (max 30 points)
  const inc = parseFloat(income);
  if (inc < 10000)      score += 30;
  else if (inc < 20000) score += 20;
  else if (inc < 30000) score += 10;

  // Family size factor (max 20 points)
  const fam = parseInt(family_members);
  if (fam > 5)      score += 20;
  else if (fam > 3) score += 10;

  // Urgency factor (max 30 points)
  const urgencyMap = { Critical: 30, High: 20, Medium: 10, Low: 5 };
  score += urgencyMap[urgency] || 0;

  // Document factor (max 20 points)
  if (hasDocuments) score += 20;

  return score;  // Maximum 100
}

function priorityLevel(score) {
  if (score >= 60) return 'High';
  if (score >= 30) return 'Medium';
  return 'Low';
}
```

This function is called server-side only, after the form data arrives. The beneficiary has no visibility into the scoring formula and cannot manipulate the result by sending a crafted HTTP request.

---

### 5.7.3 Atomic Approval (`backend/controllers/adminController.js`)

The most critical operation in the system — approving an application and allocating funds — is implemented with full database transaction safety:

```javascript
const approveApplication = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Fetch and validate application
    const [apps] = await connection.query(
      'SELECT * FROM applications WHERE id = ?', [req.params.id]
    );
    if (apps.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Application not found' });
    }
    if (apps[0].status !== 'pending') {
      await connection.rollback();
      return res.status(400).json({ message: 'Application is not pending' });
    }

    // Check fund availability
    const [[{ total_donated }]] = await connection.query(
      'SELECT COALESCE(SUM(amount), 0) AS total_donated FROM donations'
    );
    const [[{ total_allocated }]] = await connection.query(
      "SELECT COALESCE(SUM(amount), 0) AS total_allocated FROM transactions WHERE type = 'allocation'"
    );
    const available = parseFloat(total_donated) - parseFloat(total_allocated);

    if (parseFloat(apps[0].amount) > available) {
      await connection.rollback();
      return res.status(400).json({
        message: `Insufficient funds. Available: $${available.toFixed(2)}`
      });
    }

    // Atomic update
    await connection.query(
      "UPDATE applications SET status='approved', amount_allocated=?, reviewed_by=?, reviewed_at=NOW() WHERE id=?",
      [apps[0].amount, req.user.id, apps[0].id]
    );
    await connection.query(
      "INSERT INTO transactions (application_id, beneficiary_id, amount, type) VALUES (?,?,?,'allocation')",
      [apps[0].id, apps[0].beneficiary_id, apps[0].amount]
    );

    await connection.commit();
    res.json({ message: 'Application approved successfully' });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ message: 'Server error', error: err.message });
  } finally {
    connection.release();
  }
};
```

---

### 5.7.4 JWT Authentication Middleware (`backend/middleware/auth.js`)

```javascript
const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];  // Extract from "Bearer <token>"

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;  // { id, name, email, role, iat, exp }
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access forbidden: insufficient permissions' });
    }
    next();
  };
};
```

---

### 5.7.5 Database Schema (Key Tables)

```sql
CREATE TABLE applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  beneficiary_id INT NOT NULL,
  phone VARCHAR(30),
  address TEXT,
  income DECIMAL(12, 2) NOT NULL,
  family_members INT NOT NULL,
  employment_status VARCHAR(50) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  category ENUM('Medical', 'Education', 'Emergency', 'Other') NOT NULL,
  reason TEXT NOT NULL,
  urgency ENUM('Low', 'Medium', 'High', 'Critical') NOT NULL,
  documents_path TEXT DEFAULT NULL,
  priority_score INT NOT NULL DEFAULT 0,
  priority_level ENUM('Low', 'Medium', 'High') NOT NULL DEFAULT 'Low',
  status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  amount_allocated DECIMAL(10, 2) DEFAULT NULL,
  reviewed_by INT DEFAULT NULL,
  reviewed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (beneficiary_id) REFERENCES users(id),
  FOREIGN KEY (reviewed_by) REFERENCES users(id)
);

CREATE TABLE transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  application_id INT DEFAULT NULL,
  beneficiary_id INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  type ENUM('allocation', 'donation') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES applications(id),
  FOREIGN KEY (beneficiary_id) REFERENCES users(id)
);
```

---

## 5.8 Snapshot (Screen Captures)

### Figure 5.7.1 — Home / Landing Page

The FinWelfare landing page (`index.html`) features a full-screen hero section with animated gradient background blobs and a particle animation layer. The navigation bar contains links to the Features, How It Works, About, and Testimonials sections, along with Login and Get Started CTAs.

Key UI elements:
- **Hero badge:** "Now live – transparent welfare funding platform"
- **Headline:** "Empowering Transparent Social Welfare Funding"
- **Trust indicators:** Bank-level security | Real-time updates | Open & transparent | Role-based access
- **Animated statistics counter:** Shows live fund statistics

---

### Figure 5.7.2 — Login Page

The login page (`login.html`) provides a clean, card-based login form centred on the screen. It includes:
- Email and password input fields with real-time validation
- "Remember me" checkbox
- "Forgot Password?" link
- Error message display area for invalid credentials
- Link to the registration page

After successful login, the frontend reads the `role` field from the JWT payload and redirects to the appropriate dashboard (`donor.html`, `beneficiary.html`, or `admin.html`).

---

### Figure 5.7.3 — Signup / Registration Page

The registration page accepts:
- Full Name
- Email Address
- Password (with strength indicator)
- Role selection (Donor / Beneficiary) via radio buttons or dropdown

Form validation is performed client-side (HTML5 `required`, `type="email"`) and server-side (role validation, duplicate email check).

---

### Figure 5.7.4 — Donor Dashboard (`donor.html`)

The donor dashboard displays:
- **Welcome card** with the donor's name
- **Fund Statistics panel:** Total Donated (all donors), Total Allocated, Available Balance — each in a coloured card with icon
- **Donation Form:** Amount field and optional message textarea, with Submit button
- **Donation History table:** Lists the donor's past contributions with date, amount, and message

---

### Figure 5.7.5 — Beneficiary Dashboard (`beneficiary.html`)

The beneficiary dashboard displays:
- **Welcome card** with the beneficiary's name
- **Application Form:** Phone, Address, Monthly Income, Family Members, Employment Status, Amount Requested, Category (Medical/Education/Emergency/Other), Reason for Request, Urgency Level (Low/Medium/High/Critical), Document uploads (Income Proof, ID Proof, Supporting Docs)
- **My Applications table:** Lists all submitted applications with status badge (pending/approved/rejected), amount, category, and submission date

---

### Figure 5.7.6 — Admin Dashboard (`admin.html`)

The admin dashboard is the most feature-rich page. It includes:

**Statistics Cards Row:**
- Total Users registered
- Total Donations (sum)
- Total Applications
- Pending Applications
- Approved Applications
- Available Funds

**Applications Table:** Lists all applications sorted by priority score (highest first). Each row shows: applicant name, category, amount requested, urgency, priority score, priority level (colour-coded badge), status, and Approve/Reject action buttons. Clicking a row expands the score breakdown showing individual factor contributions.

**Donations Tab:** Full list of all donations with donor names, emails, amounts, and timestamps.

**Users Tab:** Complete user registry showing all registered users, their roles, and registration dates.

---

---

# CHAPTER 6: SYSTEM TESTING

## 6.1 Testing Methodologies

Software testing is the process of evaluating a system to identify discrepancies between expected and actual behaviour. FinWelfare was tested using the following methodologies:

### 6.1.1 Black-Box Testing

Black-box testing treats the system as an opaque box — the tester provides inputs and observes outputs without knowledge of internal implementation. This approach was used for:
- Testing API endpoints via Postman by sending various valid and invalid requests
- Testing the frontend via web browser by simulating user interactions
- Verifying that error messages are appropriate and informative

### 6.1.2 White-Box Testing

White-box testing examines the internal code structure. This approach was used for:
- Tracing the priority scoring algorithm through sample input values and verifying mathematical correctness
- Reviewing the atomic transaction code to verify that rollback occurs correctly on failure
- Checking that all input validation conditions are reachable

### 6.1.3 Boundary Value Analysis

Boundary value testing focuses on the edges of valid input ranges:
- Testing donation amount with exactly 0 (should fail), 0.01 (should succeed)
- Testing family_members with 1, 3, 4, 5, 6 (each triggers different score brackets)
- Testing income with 9999, 10000, 19999, 20000, 29999, 30000 (each triggers different score brackets)

### 6.1.4 Security Testing

Security testing verifies that the system resists known attack vectors:
- Attempting to access protected endpoints without a JWT (should return 401)
- Attempting to access admin endpoints with a donor JWT (should return 403)
- Attempting to brute-force the login endpoint (should be rate-limited after 20 attempts)
- Attempting to upload a PHP file disguised as a PDF (should be rejected by Multer)
- Verifying that passwords are never returned in API responses
- Verifying that bcrypt-hashed passwords in the database cannot be trivially reversed

---

## 6.2 Unit Testing

Unit testing validates individual functions and modules in isolation.

### Table 6.1 — Test Cases: Authentication Module

| Test ID | Test Case | Input | Expected Output | Actual Output | Status |
|---|---|---|---|---|---|
| AUTH-01 | Register with valid data | `{name, email, password, role:'donor'}` | 201 Created, userId returned | 201, userId:6 | ✅ PASS |
| AUTH-02 | Register with duplicate email | Existing email | 409 Conflict | 409, "Email already registered" | ✅ PASS |
| AUTH-03 | Register with invalid role | `role:'superadmin'` | 400 Bad Request | 400, "Invalid role" | ✅ PASS |
| AUTH-04 | Register with missing fields | No password | 400 Bad Request | 400, "All fields required" | ✅ PASS |
| AUTH-05 | Login with valid credentials | Correct email + password | 200, JWT token returned | 200, token present | ✅ PASS |
| AUTH-06 | Login with wrong password | Correct email, wrong password | 401 Unauthorized | 401, "Invalid credentials" | ✅ PASS |
| AUTH-07 | Login with non-existent email | Unknown email | 401 Unauthorized | 401, "Invalid credentials" | ✅ PASS |
| AUTH-08 | Access protected route without token | No Authorization header | 401 Unauthorized | 401, "Access token required" | ✅ PASS |
| AUTH-09 | Access protected route with expired token | Expired JWT | 403 Forbidden | 403, "Invalid or expired token" | ✅ PASS |
| AUTH-10 | Access admin route with donor token | Donor JWT on /api/admin | 403 Forbidden | 403, "Access forbidden" | ✅ PASS |

---

### Table 6.2 — Test Cases: Donation Module

| Test ID | Test Case | Input | Expected Output | Actual Output | Status |
|---|---|---|---|---|---|
| DON-01 | Submit valid donation | `{amount: 500, message:'Test'}` + donor JWT | 201, donationId returned | 201, donationId:4 | ✅ PASS |
| DON-02 | Submit donation with zero amount | `{amount: 0}` | 400 Bad Request | 400, "Valid donation amount required" | ✅ PASS |
| DON-03 | Submit donation with negative amount | `{amount: -100}` | 400 Bad Request | 400, "Valid donation amount required" | ✅ PASS |
| DON-04 | Submit donation as beneficiary | Beneficiary JWT | 403 Forbidden | 403, "Access forbidden" | ✅ PASS |
| DON-05 | Get donation history | Donor JWT | 200, array of donations | 200, [{...}, {...}] | ✅ PASS |
| DON-06 | Get fund totals | Donor JWT | 200, {total_donated, total_allocated, available_funds} | 200, correct values | ✅ PASS |
| DON-07 | Verify available funds calculation | total_donated=10000, total_allocated=3900 | available=6100 | 6100.00 | ✅ PASS |

---

### Table 6.3 — Test Cases: Application Module

| Test ID | Test Case | Input | Expected Output | Actual Output | Status |
|---|---|---|---|---|---|
| APP-01 | Submit valid application | All required fields + beneficiary JWT | 201, priority_score, priority_level | 201, score:70, level:'High' | ✅ PASS |
| APP-02 | Submit with missing required field | No urgency field | 400 Bad Request | 400, "All required fields must be provided" | ✅ PASS |
| APP-03 | Submit with invalid category | `category:'Housing'` | 400 Bad Request | 400, "Invalid category" | ✅ PASS |
| APP-04 | Submit with invalid urgency | `urgency:'Extreme'` | 400 Bad Request | 400, "Invalid urgency level" | ✅ PASS |
| APP-05 | Submit with negative income | `income:-1000` | 400 Bad Request | 400, "Income must be non-negative" | ✅ PASS |
| APP-06 | Submit with zero amount | `amount:0` | 400 Bad Request | 400, "Amount requested must be positive" | ✅ PASS |
| APP-07 | Priority score: income<10k, >5 family, Critical, docs | {income:5000, family:7, urgency:'Critical', hasDoc:true} | Score=100, Level='High' | Score:100, Level:'High' | ✅ PASS |
| APP-08 | Priority score: income=35000, family=2, Low, no docs | {income:35000, family:2, urgency:'Low', hasDoc:false} | Score=5, Level='Low' | Score:5, Level:'Low' | ✅ PASS |
| APP-09 | View own applications | Beneficiary JWT | 200, array of own apps | 200, [{...}, {...}] | ✅ PASS |
| APP-10 | View another user's application | Beneficiary JWT + other user's app ID | 403 Forbidden | 403, "Access denied" | ✅ PASS |

---

## 6.3 Integration Testing

Integration testing verifies that the modules work correctly when combined.

### Table 6.4 — Test Cases: Admin Module (Integration)

| Test ID | Test Case | Precondition | Expected Behaviour | Status |
|---|---|---|---|---|
| ADM-01 | View all applications | Applications exist in DB | Returns all apps sorted by priority_score DESC, with score_breakdown | ✅ PASS |
| ADM-02 | Approve application (sufficient funds) | Available funds > app.amount | App status → 'approved', transaction record created | ✅ PASS |
| ADM-03 | Approve application (insufficient funds) | Available funds < app.amount | 400, "Insufficient funds" message, no DB changes | ✅ PASS |
| ADM-04 | Approve already-approved application | App status = 'approved' | 400, "Application is not pending" | ✅ PASS |
| ADM-05 | Reject pending application | App status = 'pending' | App status → 'rejected', reviewed_by and reviewed_at updated | ✅ PASS |
| ADM-06 | Get dashboard stats after approval | One app approved | pending count decreases, approved count increases, available_funds decreases | ✅ PASS |
| ADM-07 | Atomic transaction rollback | Simulate DB failure mid-transaction | Neither application update nor transaction insert committed | ✅ PASS |
| ADM-08 | Donor cannot access admin endpoint | Donor JWT on /api/admin/stats | 403 Forbidden | ✅ PASS |
| ADM-09 | View all donations | Donations exist in DB | Returns all donations with donor_name and donor_email | ✅ PASS |
| ADM-10 | View all users (passwords excluded) | Users exist in DB | Returns all users, no password field in response | ✅ PASS |

---

## 6.4 Security Testing

### Table 6.5 — Security Test Results

| Test ID | Attack Vector | Test Method | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| SEC-01 | Unauthenticated API access | Request to /api/admin/stats with no token | 401 Unauthorized | 401 | ✅ PASS |
| SEC-02 | Wrong role access | Donor JWT on /api/admin endpoint | 403 Forbidden | 403 | ✅ PASS |
| SEC-03 | JWT tampering | Modify payload, original signature | 403 Invalid token | 403 | ✅ PASS |
| SEC-04 | SQL injection via email field | `' OR 1=1 --` in email | Parameterised query, no injection | Safe, 401 returned | ✅ PASS |
| SEC-05 | Brute force login | 25 rapid login attempts | Rate limited after 20 | 429 Too Many Requests | ✅ PASS |
| SEC-06 | Malicious file upload (.php) | Upload PHP file as income_proof | Rejected by MIME check | 400, type not allowed | ✅ PASS |
| SEC-07 | Large file DoS | Upload 50 MB file | Rejected, 5 MB limit | 400, file too large | ✅ PASS |
| SEC-08 | Password in API response | Call /api/auth/login | No password field in response | No password field | ✅ PASS |
| SEC-09 | CORS policy | Cross-origin request from disallowed origin | CORS header controls access | Controlled by cors() | ✅ PASS |
| SEC-10 | Insufficient funds bypass | Craft request to approve when broke | Atomic check prevents it | 400, insufficient funds | ✅ PASS |

---

## 6.5 Testing under Various States

### State 1: Empty Database (Fresh Installation)

After running `schema.sql` with demo data disabled, the system was tested with no users, no donations, and no applications:

- Landing page renders correctly
- Login page renders correctly
- Registration creates the first user
- Admin dashboard shows all zeros
- Applications list returns empty array
- Fund totals show 0/0/0

**Result:** System handles empty state gracefully with no errors or NaN values.

---

### State 2: Normal Operation (Active Fund, Multiple Pending Applications)

With 3 donations totalling $10,000 and 4 applications of varying priorities:

- Applications correctly sorted by priority score (highest first)
- Fund statistics accurately reflect $10,000 donated, $0 allocated, $10,000 available
- Approve action updates statistics in real time
- Available funds decrease correctly after each approval

**Result:** All operations functioned correctly. Financial calculations were verified against manually computed values.

---

### State 3: Fund Exhaustion

When available funds drop below the requested amount of a pending application:

- Approve button action returns HTTP 400 with "Insufficient funds" message
- No database changes are made
- Application remains in 'pending' state
- Administrator receives clear feedback

**Result:** System correctly prevents over-allocation of funds.

---

### State 4: Concurrent Approval Attempts

A scenario was simulated where two admin accounts attempted to approve the same application near-simultaneously:

Due to MySQL's InnoDB row-level locking during the transaction, the second approval attempt encounters either a "not pending" error (if the first completed) or a lock wait (resolved by MySQL's built-in deadlock detection).

**Result:** The system's atomic transaction design prevents double-approval. This is a significant advantage over spreadsheet-based systems.

---

### State 5: Invalid / Malformed Input

Various forms of malformed input were submitted to all endpoints:

- Empty strings for required fields
- Non-numeric values for amount and income fields
- Values outside ENUM ranges for category, urgency, role
- Excessively long strings (tested against VARCHAR limits)

**Result:** All malformed inputs were rejected with appropriate 400 Bad Request responses and descriptive error messages. No server crashes or unhandled exceptions were observed.

---

---

# CHAPTER 7: CONCLUSION AND FUTURE SCOPE

## 7.1 Conclusion

The FinWelfare — Financial Resource Management for Social Welfare — project set out to address a genuine and widespread problem: the inefficiency, opacity, and inequity of manual welfare fund management. By the end of the development lifecycle, all primary and secondary project objectives have been achieved.

**Key Achievements:**

1. **Centralised, Structured Fund Management:** All donations and disbursements are now managed through a single, unified web platform, replacing ad hoc spreadsheets and paper forms. The `transactions` table provides a complete, immutable audit trail of every financial event.

2. **Role-Based Access Control:** The three-role system (Admin, Donor, Beneficiary) with JWT-based authentication and middleware-enforced authorisation ensures that each type of user can only see and do what they are supposed to. A donor cannot review applications; a beneficiary cannot approve their own application; an admin cannot submit donations or applications.

3. **Objective Priority Scoring:** The server-side priority scoring engine provides a mathematically deterministic, tamper-proof ranking of all pending applications. This removes subjectivity and bias from the review process. Applications from families with critical medical needs and very low income will always rank above applications for discretionary expenditures — automatically.

4. **Atomic Fund Allocation:** The use of MySQL transactions in the approval workflow guarantees that it is impossible to approve an application without recording the corresponding transaction, or to create a transaction without properly approving the application. This atomic design prevents financial inconsistencies that plague spreadsheet-based systems.

5. **Security-First Design:** bcrypt-hashed passwords, JWT session management, role-based endpoint protection, rate limiting, file type validation, and parameterised SQL queries combine to create a defence-in-depth security posture that protects both the platform and its users' sensitive financial data.

6. **Practical, Deployable System:** Unlike theoretical academic projects, FinWelfare is a production-ready system. It can be deployed on any Linux server, configured via environment variables, and used by a real welfare organisation on day one after database initialisation.

7. **Technology Learning Outcomes:** This project provided hands-on experience with the full web application stack: RESTful API design, relational database schema design, asynchronous JavaScript programming, JWT authentication, file upload handling, and frontend-backend integration. These are directly marketable skills in the software industry.

**Limitations of the Current Implementation:**

1. **No Email Notifications:** When an application is approved or rejected, the beneficiary is not automatically notified by email. They must log in and check their dashboard.

2. **No Real Payment Processing:** The donation module records donation amounts but does not integrate with a real payment gateway (e.g., Razorpay, Stripe, PayPal). In a production deployment, this integration would be required.

3. **Single Administrator:** The system supports only one admin role without sub-roles or permissions granularity. There is no "reviewer" role that can only approve/reject without seeing user management data.

4. **No Pagination on Large Tables:** The admin applications list returns all records at once. For organisations with thousands of applications, this would require pagination to remain performant.

5. **No Automated Report Generation:** The system tracks all data but does not generate downloadable PDF or Excel reports for donors, beneficiaries, or auditors.

6. **No Password Reset Flow:** The current system has no "forgot password" feature. If a user forgets their password, an administrator must manually reset it in the database.

---

## 7.2 Future Scope

The following enhancements are planned or recommended for future versions of FinWelfare:

### 7.2.1 Email Notification System

Integrate a transactional email service (e.g., SendGrid, Nodemailer + SMTP) to send:
- Registration confirmation emails
- Application submission receipts with application ID
- Status update notifications (approved/rejected) to beneficiaries
- Weekly digest emails to admins summarising pending applications
- Donation receipts/acknowledgements to donors

**Implementation:** Add a `sendEmail(to, subject, body)` utility function and call it after relevant database operations.

### 7.2.2 Payment Gateway Integration

Integrate a live payment gateway to enable real online donations:
- **Razorpay** (preferred for India — supports UPI, net banking, credit/debit cards)
- **Stripe** (international — supports 135+ currencies)
- **PayPal** (for NGOs with international donors)

The integration would add a payment initiation API, a webhook endpoint to receive payment confirmation, and automatic recording of confirmed transactions in the donations table.

### 7.2.3 Pagination and Search

For scalability, the admin applications endpoint should be refactored to support:
- Server-side pagination (limit + offset query parameters)
- Full-text search by beneficiary name, category, or reason
- Filtering by status, priority level, date range
- Sorting by any column (not just priority score)

### 7.2.4 Advanced Admin Roles

Introduce a role hierarchy:
- **Super Admin** — full system access including user deletion and system configuration
- **Reviewer** — can approve/reject applications but cannot manage users
- **Finance Officer** — can view financial reports but cannot modify application statuses

### 7.2.5 Automated PDF Report Generation

Generate downloadable PDF reports using a library such as `pdfkit` or `puppeteer`:
- **Donor Statement:** List of all donations made, total contributed, impact summary
- **Beneficiary Award Letter:** Official letter confirming approval and amount allocated
- **Admin Monthly Report:** Financial summary, application statistics, fund utilisation

### 7.2.6 Mobile Application

Develop a companion mobile application (React Native or Flutter) that provides:
- Push notifications for application status updates
- Biometric authentication (fingerprint/face ID)
- Offline application drafting (sync when internet is available)
- Mobile-optimised donation experience with UPI deeplinks

### 7.2.7 Blockchain Audit Trail

For maximum transparency, the transactions table could be mirrored to a public blockchain (Ethereum, Polygon, or Hyperledger Fabric) to create an externally verifiable audit trail. Donors would be able to independently verify that their contribution was used for a specific approved application — without trusting the organisation's internal records.

### 7.2.8 AI-Assisted Priority Review

Integrate a machine learning model (e.g., a logistic regression classifier trained on historical approval data) to provide the admin with a recommendation ("Likely to benefit most from assistance") alongside the rule-based priority score. This would help administrators process large volumes of applications more efficiently.

### 7.2.9 Multi-Language Support (i18n)

Add internationalisation support to serve beneficiaries in their native languages (Hindi, Urdu, Bengali, Tamil, etc.) using the browser's `Intl` API and a language file system in the frontend.

### 7.2.10 Two-Factor Authentication (2FA)

Add TOTP-based (Time-based One-Time Password) two-factor authentication for administrator accounts, significantly increasing the security of the most privileged account type.

---

---

# CHAPTER 8: REFERENCES

## 8.1 Books

1. **Brown, Ethan** (2019). *Web Development with Node and Express: Leveraging the JavaScript Stack* (2nd ed.). O'Reilly Media. ISBN: 978-1492053514

2. **Wieruch, Robin** (2020). *The Road to React*. Self-published. Available at: https://www.roadtoreact.com

3. **Date, C.J.** (2003). *An Introduction to Database Systems* (8th ed.). Pearson Education. ISBN: 978-0321197849

4. **Vieira, Robert** (2014). *Professional SQL Server 2012/2014: Programming and Administration*. Wrox Press. (Concepts applicable to MySQL)

5. **Beyer, Betsy; Jones, Chris; Petoff, Jennifer; Murphy, Niall Richard** (2016). *Site Reliability Engineering*. O'Reilly Media. ISBN: 978-1491929124

6. **Hoffman, Kevin** (2017). *Beyond the Twelve-Factor App*. O'Reilly Media.

---

## 8.2 Research Papers and Articles

1. **Moein Mehrtash, Hamid Mukhtar, and Adeel Anjum** (2019). "Security Challenges in RESTful Web Service Composition." *IEEE Access*, vol. 7, pp. 160107–160127. DOI: 10.1109/ACCESS.2019.2951505

2. **Florentin Ipate, Mike Holcombe** (1997). "An Integration Testing Method That Is Proved to Find All Faults." *International Journal of Computer Mathematics*, vol. 63, no. 3–4, pp. 159–178.

3. **OWASP Foundation** (2021). *OWASP Top Ten Web Application Security Risks*. Available at: https://owasp.org/www-project-top-ten/

4. **Provos, Niels and Mazieres, David** (1999). "A Future-Adaptable Password Scheme." *Proceedings of the 1999 USENIX Annual Technical Conference*, Monterey, California. (Original bcrypt paper)

5. **Jones, M.B.; Bradley, J.; Sakimura, N.** (2015). *JSON Web Token (JWT)*, RFC 7519. Internet Engineering Task Force (IETF). Available at: https://tools.ietf.org/html/rfc7519

6. **Fielding, Roy Thomas** (2000). "Architectural Styles and the Design of Network-based Software Architectures." *Doctoral dissertation*, University of California, Irvine. (Foundational REST paper)

---

## 8.3 Websites

1. Mozilla Developer Network (MDN) — JavaScript Reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript

2. W3Schools — HTML, CSS, JavaScript Tutorials: https://www.w3schools.com

3. Stack Overflow — Developer Q&A Community: https://stackoverflow.com

4. GitHub — Source Code Repository Hosting: https://github.com

5. npm (Node Package Manager) Registry: https://www.npmjs.com

6. DigitalOcean Community Tutorials — Node.js and MySQL Deployment: https://www.digitalocean.com/community/tutorials

7. JWT.io — JWT Debugger and Library Directory: https://jwt.io

8. OWASP (Open Web Application Security Project): https://owasp.org

---

## 8.4 Online Documentation

1. **Node.js Official Documentation** (v18 LTS): https://nodejs.org/en/docs/

2. **Express.js Official Documentation** (v4.x): https://expressjs.com/en/4x/api.html

3. **MySQL 8.0 Reference Manual**: https://dev.mysql.com/doc/refman/8.0/en/

4. **mysql2 npm Package Documentation**: https://github.com/sidorares/node-mysql2

5. **jsonwebtoken npm Package Documentation**: https://github.com/auth0/node-jsonwebtoken

6. **bcryptjs npm Package Documentation**: https://github.com/dcodeIO/bcrypt.js

7. **Multer npm Package Documentation**: https://github.com/expressjs/multer

8. **express-rate-limit npm Package Documentation**: https://github.com/express-rate-limit/express-rate-limit

9. **dotenv npm Package Documentation**: https://github.com/motdotla/dotenv

10. **MDN HTTP Status Codes Reference**: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status

---

---

*End of Project Report*

---

> **Document Information**
> - **Project:** Financial Resource Management for Social Welfare (FinWelfare)
> - **Technology Stack:** Node.js 18 · Express.js 4.18 · MySQL 8.0 · HTML5 · CSS3 · Vanilla JavaScript
> - **Backend Dependencies:** express, mysql2, jsonwebtoken, bcryptjs, multer, express-rate-limit, dotenv, cors
> - **Academic Year:** 2024–2025
> - **Total Chapters:** 8
> - **Total Sections:** 42+
