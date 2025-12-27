# Multi-Tenant SaaS - Project & Task Management

Production-ready multi-tenant SaaS platform with complete data isolation, RBAC, and subscription limits.

## Features
-  Multi-tenancy with `tenant_id` isolation
-  JWT authentication (24h expiry)
-  3 User roles: Super Admin, Tenant Admin, User
-  Subscription plans: Free/Pro/Enterprise
-  Dockerized (1 command deploy)
-  22 REST APIs fully documented

## Quick Start

```bash
# Clone & Run (All services)
git clone <repo>
cd project
docker-compose up -d

# Access:
# Frontend: http://localhost:3000
# Backend:  http://localhost:5000/api
# Database: localhost:5432
````

##  Test Credentials

| Role         | Email                   | Password   | Tenant |
| ------------ | ----------------------- | ---------- | ------ |
| Super Admin  | `superadmin@system.com` | `Admin123` | None   |
| Tenant Admin | `admin@demo.com`        | `Demo123`  | `demo` |
| User         | `user1@demo.com`        | `User123`  | `demo` |

##  Project Structure

```text
├── backend/          # Node.js + Express API
├── frontend/         # React SPA
├── database/         # Migrations + Seeds
├── docs/             # API, Architecture, ERD
└── docker-compose.yml
```

##  Services

| Service  | Port    | Status                                                                 |
| -------- | ------- | ---------------------------------------------------------------------- |
| Frontend | `:3000` |  [http://localhost:3000](http://localhost:3000)                       |
| Backend  | `:5000` |  [http://localhost:5000/api/health](http://localhost:5000/api/health) |
| Database | `:5432` |  PostgreSQL (saasdb)                                                  |

## Authentication Flow

1. **Register Tenant**: `POST /api/auth/register-tenant`
2. **Login**: `POST /api/auth/login` → Get JWT
3. **Use JWT**: `Authorization: Bearer <token>`

##  API Modules (22 Endpoints)

* **Auth** (4): Register, Login, Me, Logout
* **Tenants** (4): List, Get, Update, Stats
* **Users** (4): Add, List, Update, Delete
* **Projects** (5): CRUD + List
* **Tasks** (5): CRUD + Status updates

**Full API Docs**: `docs/API.md`

## Architecture

```text
Browser → React (3000) → Express API (5000) → PostgreSQL (5432)
          ↓ JWT Auth                    ↓ tenant_id filter
```

**Diagrams**:

* [System Architecture](docs/images/system-architecture.png)
* [Database ERD](docs/images/database-erd.png)

## Local Development

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend  
cd frontend
npm install
npm start

# Database (Docker)
docker run -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:15
```

##  Docker Commands

```bash
docker-compose up -d          # Start all
docker-compose down           # Stop
docker-compose logs backend   # View logs
docker exec -it backend sh    # Shell access
```

##  Documentation

| File                   | Description            |
| ---------------------- | ---------------------- |
| `docs/API.md`          | 22 APIs with examples  |
| `docs/architecture.md` | System design + ERD    |
| `docs/PRD.md`          | Product requirements   |
| `submission.json`      | Evaluation credentials |

## Evaluation Checklist

* [x] Docker: `docker-compose up -d` works
* [x] Health: `GET /api/health` → `{"status":"ok"}`
* [x] Multi-tenancy: tenant_id isolation
* [x] RBAC: Role-based access enforced
* [x] Limits: Subscription plan enforcement
* [x] Seed data: Test accounts loaded

## Contribution

```bash
1. Fork repo
2. git checkout -b feature/xyz
3. docker-compose up --build
4. Test: http://localhost:3000
5. PR to main
```

## License

MIT - Free to use and modify

