# Technical Specification
## Multi-Tenant SaaS Platform – Project & Task Management System

---

## 1. Project Structure

The project follows a clear separation of concerns by organizing backend, frontend, and documentation into dedicated directories. This structure improves maintainability, scalability, and collaboration.

---

### 1.1 Backend Folder Structure

**Folder: backend/src/**

- **controllers/**  
  Handles API request logic. Receives requests, applies business logic, and returns responses.

- **routes/**  
  Defines API endpoints and maps them to controllers.

- **middleware/**  
  Reusable middleware like authentication, role-based access control (RBAC), and error handling.

- **models/**  
  Database models and ORM schemas (users, tenants, projects, tasks).

- **utils/**  
  Utility functions: token generation, password hashing, helper methods.

- **config/**  
  Configuration files for DB connection, environment variables, and app settings.

- **migrations/**  
  Database migration and seed files for schema creation and initial data setup.

- **tests/**  
  Unit and integration tests for backend APIs.

---

### 1.2 Frontend Folder Structure

**Folder: frontend/src/**

- **pages/**  
  Main application pages: Login, Dashboard, Projects, Users.

- **components/**  
  Reusable UI components: forms, tables, buttons, modals.

- **services/**  
  API communication with backend using HTTP clients.

- **context/**  
  Global state management: authentication, user data.

- **routes/**  
  Defines protected and public routes.

- **styles/**  
  Global and component-level styling files.

- **public/**  
  Static assets: images, icons.

---

## 2. Development Setup Guide

### 2.1 Prerequisites

Install the following tools:

- Node.js (v18+)
- npm (bundled with Node.js)
- Docker
- Docker Compose
- Git

---

### 2.2 Environment Variables

The application uses environment variables for configuration. Define them in a `.env` file at the project root or directly in `docker-compose.yml`.

**Required Variables:**

- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `JWT_SECRET`
- `JWT_EXPIRY`
- `NODE_ENV`

> For evaluation, development or test values can be used.

---

### 2.3 Installation Steps

1. Clone the repository:

```bash
git clone <repository-url>
cd multi-tenant-saas
````

2. Install backend dependencies:

```bash
cd backend
npm install
```

3. Install frontend dependencies:

```bash
cd ../frontend
npm install
```

---

### 2.4 Running the Application Locally

The application is containerized and can be started using Docker Compose:

```bash
docker-compose up -d
```

This starts:

* PostgreSQL database on port 5432
* Backend API server on port 5000
* Frontend React app on port 3000

---

### 2.5 Running Tests

**Backend Tests:**

```bash
cd backend
npm test
```

**Frontend Tests:**

```bash
cd frontend
npm test
```

