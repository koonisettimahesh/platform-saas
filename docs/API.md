# API Documentation
## Multi-Tenant SaaS Platform – Project & Task Management System

**Base URL (Local):** `http://localhost:5000/api`

---

## Authentication Summary
* **Method:** JWT-based authentication using Bearer Tokens.
* **Header Format:** `Authorization: Bearer <JWT_TOKEN>`
* **Token Expiry:** 24 hours.
* **Access Control:** * Super Admin has no tenant association and can manage all tenants.
    * Tenant users are strictly restricted to their own tenant's data.
    * Role-based access is enforced at the API level.

---

## 1. Authentication APIs

### API 1: Register Tenant
Registers a new tenant and creates a tenant admin.
* **Endpoint:** `POST /auth/register-tenant`
* **Authentication:** Not Required

#### Request Body

{
  "tenantName": "Test Company Alpha",
  "subdomain": "testalpha",
  "adminEmail": "admin@testalpha.com",
  "adminPassword": "TestPass@123",
  "adminFullName": "Alpha Admin"
}

## Success Response (201)

{
  "success": true,
  "message": "Tenant registered successfully",
  "data": {
    "tenantId": "uuid",
    "subdomain": "testalpha",
    "adminUser": {
      "id": "uuid",
      "email": "admin@testalpha.com",
      "fullName": "Alpha Admin",
      "role": "tenant_admin"
    }
  }
}

## API 2: Login
Authenticates user and returns JWT token.

- Endpoint: POST /auth/login

- Authentication: Not Required

### Request Body

{
  "email": "admin@demo.com",
  "password": "Demo@123",
  "tenantSubdomain": "demo"
}

## Success Response (200)

{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "admin@demo.com",
      "fullName": "Demo Admin",
      "role": "tenant_admin",
      "tenantId": "uuid"
    },
    "token": "jwt-token",
    "expiresIn": 86400
  }
}

## API 3: Get Current User
- Endpoint: GET /auth/me

- Authentication: Required

## API 4: Logout
- Endpoint: POST /auth/logout

- Authentication: Required

## 2. Tenant Management APIs
## API 5: Get Tenant Details
- Endpoint: GET /tenants/:tenantId

- Authentication: Required

- Authorization: Tenant Admin (own tenant) or Super Admin

## Success Response (200)

{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Demo Company",
    "subdomain": "demo",
    "status": "active",
    "subscriptionPlan": "pro",
    "maxUsers": 25,
    "maxProjects": 15,
    "createdAt": "timestamp",
    "stats": {
      "totalUsers": 5,
      "totalProjects": 3,
      "totalTasks": 12
    }
  }
}

## API 6: Update Tenant
- Endpoint: PUT /tenants/:tenantId

- Authentication: Required

- Authorization: * Tenant Admin -> update name only

  - Super Admin -> update all fields

## API 7: List All Tenants
- Endpoint: GET /tenants

- Authentication: Required

- Authorization: Super Admin only

- Query Parameters: page, limit, status, subscriptionPlan

## 3. User Management APIs
## API 8: Add User to Tenant
- Endpoint: POST /tenants/:tenantId/users

- Authentication: Required

- Authorization: Tenant Admin

## API 9: List Tenant Users
- Endpoint: GET /tenants/:tenantId/users

- Authentication: Required

## API 10: Update User
- Endpoint: PUT /users/:userId

- Authentication: Required

## API 11: Delete User
- Endpoint: DELETE /users/:userId

- Authentication: Required

## 4. Project Management APIs
- API 12: Create Project
- Endpoint: POST /projects

- Authentication: Required

## API 13: List Projects
- Endpoint: GET /projects

- Authentication: Required

## API 14: Update Project
- Endpoint: PUT /projects/:projectId

- Authentication: Required

## API 15: Delete Project
- Endpoint: DELETE /projects/:projectId

- Authentication: Required

## 5. Task Management APIs
## API 16: Create Task
- Endpoint: POST /projects/:projectId/tasks

- Authentication: Required

## API 17: List Project Tasks
- Endpoint: GET /projects/:projectId/tasks

- Authentication: Required

## API 18: Update Task Status
- Endpoint: PATCH /tasks/:taskId/status

- Authentication: Required

## API 19: Update Task
- Endpoint: PUT /tasks/:taskId

- Authentication: Required

## 6. Health Check API
- API 20: Health Check
- : GET /health

- Authentication: Not Required

### Success Response (200)

JSON

{
  "status": "ok",
  "database": "connected"
}