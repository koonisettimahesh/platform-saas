# System Architecture Document
## Multi-Tenant SaaS Platform – Project & Task Management System

---

## 1. System Architecture Overview

The system follows a standard three-tier architecture consisting of a frontend client, backend API server, and a relational database. The application is designed as a multi-tenant SaaS platform where tenant isolation is enforced at the application and database levels using a tenant identifier.

### Architecture Components
- **Client (Browser):** Users interact with the system through a web browser.
- **Frontend Application:** A React-based single-page application that handles UI rendering and user interactions.
- **Backend API Server:** A Node.js and Express.js server responsible for business logic, authentication, authorization, and data processing.
- **Database:** PostgreSQL database that stores tenant, user, project, task, and audit log data.
- **Authentication Flow:** JWT-based authentication ensures secure and stateless communication between frontend and backend.

---

## 2. System Architecture Diagram

The system architecture diagram illustrates how the frontend, backend, and database interact with each other. Authentication is handled using JSON Web Tokens (JWT), which are issued by the backend upon successful login and attached to subsequent API requests.

**Diagram Location:**  
`docs/images/system-architecture.png`

---

## 3. Database Schema Design (ERD)

The database schema is designed to support strict multi-tenancy using a shared database and shared schema approach. Each core table includes a `tenant_id` column to enforce data isolation. Foreign key relationships ensure data integrity, and indexes on `tenant_id` improve query performance.

### Core Tables
- **tenants**
- **users**
- **projects**
- **tasks**
- **audit_logs**

Each user, project, and task is associated with a tenant. Super Admin users are the only exception and have a NULL `tenant_id`.

**ERD Location:**  
`docs/images/database-erd.png`

---

## 4. API Architecture

The API layer is organized into modules based on functionality. All protected endpoints require JWT authentication, and role-based access control (RBAC) is enforced for sensitive operations.

### 4.1 Authentication APIs
| Endpoint | Method | Auth Required | Role |
|--------|--------|--------------|------|
| /api/auth/register | POST | No | Public |
| /api/auth/login | POST | No | Public |
| /api/auth/me | GET | Yes | All |
| /api/auth/logout | POST | Yes | All |

---

### 4.2 Tenant Management APIs
| Endpoint | Method | Auth Required | Role |
|--------|--------|--------------|------|
| /api/tenants | GET | Yes | Super Admin |
| /api/tenants/:id | GET | Yes | Super Admin |
| /api/tenants/:id/plan | PUT | Yes | Super Admin |

---

### 4.3 User Management APIs
| Endpoint | Method | Auth Required | Role |
|--------|--------|--------------|------|
| /api/users | POST | Yes | Tenant Admin |
| /api/users | GET | Yes | Tenant Admin |
| /api/users/:id | DELETE | Yes | Tenant Admin |

---

### 4.4 Project Management APIs
| Endpoint | Method | Auth Required | Role |
|--------|--------|--------------|------|
| /api/projects | POST | Yes | Tenant Admin |
| /api/projects | GET | Yes | All |
| /api/projects/:id | GET | Yes | All |
| /api/projects/:id | PUT | Yes | Tenant Admin |
| /api/projects/:id | DELETE | Yes | Tenant Admin |

---

### 4.5 Task Management APIs
| Endpoint | Method | Auth Required | Role |
|--------|--------|--------------|------|
| /api/tasks | POST | Yes | Tenant Admin |
| /api/tasks/:id | PUT | Yes | All |
| /api/tasks | GET | Yes | All |
| /api/tasks/:id | GET | Yes | All |
