# System Architecture Document
## Multi-Tenant SaaS Platform – Project & Task Management System

---

## 1. System Architecture Overview

Three-tier architecture: **Browser → React Frontend → Node.js/Express Backend → PostgreSQL Database**.

**Multi-tenancy**: `tenant_id` column in all tables enforces data isolation.

### Components
- **Client**: Web browser
- **Frontend**: React SPA
- **Backend**: Node.js + Express API
- **Database**: PostgreSQL
- **Auth**: JWT Bearer tokens (24h expiry)

**Diagram**: `docs/images/system-architecture.png`

---

## 2. System Architecture Diagram

```
Browser (Client) 
    ↓
React Frontend 
    ↓ API Calls (JWT)
Node.js/Express Backend 
    ↓ SQL Queries
PostgreSQL Database
    ↓ tenant_id isolation
```

**Image**: `docs/images/system-architecture.png`

---

## 3. Database Schema (ERD)

**Shared schema + tenant_id isolation approach.**

### Core Tables
```
tenants
├── id (PK)
├── name
└── subdomain

users
├── id (PK)
├── tenant_id (FK) ← NULL for Super Admin
├── email (unique)
├── role
└── INDEX on tenant_id

projects
├── id (PK)
├── tenant_id (FK)
├── name
└── INDEX on tenant_id

tasks
├── id (PK)
├── project_id (FK)
├── tenant_id (FK) ← redundant for isolation
├── title
└── INDEX on tenant_id, project_id

audit_logs
├── id (PK)
├── tenant_id (FK)
└── action
```

**ERD Image**: `docs/images/database-erd.png`

---

## 4. API Architecture

### 4.1 Authentication (4 APIs)
| Endpoint | Method | Auth | Role |
|----------|--------|------|------|
| `/auth/register-tenant` | POST | No | Public |
| `/auth/login` | POST | No | Public |
| `/auth/me` | GET | Yes | All |
| `/auth/logout` | POST | Yes | All |

### 4.2 Tenant Management (4 APIs)
| Endpoint | Method | Auth | Role |
|----------|--------|------|------|
| `/tenants` | GET | Yes | Super Admin |
| `/tenants/:id` | GET | Yes | Super/Tenant Admin |
| `/tenants/:id` | PUT | Yes | Super/Tenant Admin |
| `/tenants/:id/users` | POST | Yes | Tenant Admin |

### 4.3 User Management (4 APIs)
| Endpoint | Method | Auth | Role |
|----------|--------|------|------|
| `/tenants/:id/users` | GET | Yes | Tenant Admin |
| `/users/:id` | PUT | Yes | Tenant Admin |
| `/users/:id` | DELETE | Yes | Tenant Admin |

### 4.4 Project Management (5 APIs)
| Endpoint | Method | Auth | Role |
|----------|--------|------|------|
| `/projects` | POST | Yes | All |
| `/projects` | GET | Yes | All |
| `/projects/:id` | GET | Yes | All |
| `/projects/:id` | PUT | Yes | Project Owner |
| `/projects/:id` | DELETE | Yes | Tenant Admin |

### 4.5 Task Management (5 APIs)
| Endpoint | Method | Auth | Role |
|----------|--------|------|------|
| `/projects/:id/tasks` | POST | Yes | All |
| `/projects/:id/tasks` | GET | Yes | All |
| `/tasks/:id/status` | PATCH | Yes | Assignee |
| `/tasks/:id` | PUT | Yes | All |
| `/health` | GET | No | Public |

**Total: 22 APIs** ✅

---

**File Locations:**
- Architecture Diagram: `docs/images/system-architecture.png`
- Database ERD: `docs/images/database-erd.png`
```