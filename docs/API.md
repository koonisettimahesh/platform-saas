***

# Multi-Tenant SaaS – Project & Task Management API

**Base URL (Local):** `http://localhost:5000/api`

## Authentication

- **Scheme:** JWT-based authentication using Bearer tokens  
- **Header:** `Authorization: Bearer <JWT_TOKEN>`  
- **Token expiry:** 24 hours  
- **Access control:**
  - **Super Admin:** No tenant association, can manage all tenants
  - **Tenant users:** Can access only their own tenant’s data
  - **Role-based:** Enforced at API level

***

## 1. Authentication APIs

### 1.1 Register Tenant

- **Method:** `POST`  
- **Endpoint:** `/auth/register-tenant`  
- **Authentication:** Not required  

#### Request Body

```json
{
  "tenantName": "Test Company Alpha",
  "subdomain": "testalpha",
  "adminEmail": "admin@testalpha.com",
  "adminPassword": "TestPass@123",
  "adminFullName": "Alpha Admin"
}
```

#### Success Response (201)

```json
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
```
#### Example

***

### 1.2 Login

- **Method:** `POST`  
- **Endpoint:** `/auth/login`  
- **Authentication:** Not required  

#### Request Body

```json
{
  "email": "admin@demo.com",
  "password": "Demo@123",
  "tenantSubdomain": "demo"
}
```

#### Success Response (200)

```json
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
```

***

### 1.3 Get Current User

- **Method:** `GET`  
- **Endpoint:** `/auth/me`  
- **Authentication:** Required (`Bearer <token>`)  

#### Request

- No body

```http
GET /api/auth/me
Authorization: Bearer <JWT_TOKEN>
```

#### Success Response (200)

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "admin@demo.com",
    "fullName": "Demo Admin",
    "role": "tenant_admin",
    "tenantId": "uuid"
  }
}
```

***

### 1.4 Logout

- **Method:** `POST`  
- **Endpoint:** `/auth/logout`  
- **Authentication:** Required (`Bearer <token>`)  

#### Request

- No body

#### Example

```http
POST /api/auth/logout
Authorization: Bearer <JWT_TOKEN>
```

#### Success Response (200)

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

***

## 2. Tenant Management APIs

### 2.1 Get Tenant Details

- **Method:** `GET`  
- **Endpoint:** `/tenants/:tenantId`  
- **Authentication:** Required  
- **Authorization:** Tenant Admin (own tenant) or Super Admin  

#### Path Parameters

- `tenantId` (string, required) – Tenant UUID

#### Example

```http
GET /api/tenants/5f2b8f2c-1234-5678-9999-abcdefabcdef
Authorization: Bearer <JWT_TOKEN>
```

#### Success Response (200)

```json
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
```

***

### 2.2 Update Tenant

- **Method:** `PUT`  
- **Endpoint:** `/tenants/:tenantId`  
- **Authentication:** Required  
- **Authorization:**  
  - Tenant Admin → can update **name** only  
  - Super Admin → can update all fields  

#### Path Parameters

- `tenantId` (string, required)

#### Example Request Body (Super Admin)

```json
{
  "name": "New Company Name",
  "status": "active",
  "subscriptionPlan": "enterprise",
  "maxUsers": 100,
  "maxProjects": 50
}
```

#### Example Request Body (Tenant Admin)

```json
{
  "name": "New Company Name"
}
```

#### Success Response (200)

```json
{
  "success": true,
  "message": "Tenant updated successfully",
  "data": {
    "id": "uuid",
    "name": "New Company Name",
    "subdomain": "demo",
    "status": "active",
    "subscriptionPlan": "enterprise",
    "maxUsers": 100,
    "maxProjects": 50,
    "createdAt": "timestamp"
  }
}
```

***

### 2.3 List All Tenants

- **Method:** `GET`  
- **Endpoint:** `/tenants`  
- **Authentication:** Required  
- **Authorization:** Super Admin only  

#### Query Parameters

- `page` (number, optional, default: 1)  
- `limit` (number, optional, default: 10)  
- `status` (string, optional, e.g., `active`, `inactive`)  
- `subscriptionPlan` (string, optional, e.g., `free`, `pro`, `enterprise`)

#### Example

```http
GET /api/tenants?page=1&limit=10&status=active
Authorization: Bearer <JWT_TOKEN>
```

#### Success Response (200)

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Demo Company",
      "subdomain": "demo",
      "status": "active",
      "subscriptionPlan": "pro",
      "maxUsers": 25,
      "maxProjects": 15,
      "createdAt": "timestamp"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 1
  }
}
```

***

## 3. User Management APIs

### 3.1 Add User to Tenant

- **Method:** `POST`  
- **Endpoint:** `/tenants/:tenantId/users`  
- **Authentication:** Required  
- **Authorization:** Tenant Admin  

#### Path Parameters

- `tenantId` (string, required)

#### Request Body

```json
{
  "email": "user1@demo.com",
  "fullName": "Demo User 1",
  "password": "UserPass@123",
  "role": "member"
}
```

#### Success Response (201)

```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "uuid",
    "email": "user1@demo.com",
    "fullName": "Demo User 1",
    "role": "member",
    "tenantId": "uuid"
  }
}
```

***

### 3.2 List Tenant Users

- **Method:** `GET`  
- **Endpoint:** `/tenants/:tenantId/users`  
- **Authentication:** Required  

#### Path Parameters

- `tenantId` (string, required)

#### Example

```http
GET /api/tenants/5f2b8f2c-1234-5678-9999-abcdefabcdef/users
Authorization: Bearer <JWT_TOKEN>
```

#### Success Response (200)

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "email": "admin@demo.com",
      "fullName": "Demo Admin",
      "role": "tenant_admin"
    },
    {
      "id": "uuid",
      "email": "user1@demo.com",
      "fullName": "Demo User 1",
      "role": "member"
    }
  ]
}
```

***

### 3.3 Update User

- **Method:** `PUT`  
- **Endpoint:** `/users/:userId`  
- **Authentication:** Required  

*(Authorization rules depend on your roles: typically Tenant Admin or the user themself can update.)*

#### Path Parameters

- `userId` (string, required)

#### Request Body

```json
{
  "fullName": "Updated User Name",
  "role": "member",
  "password": "NewPass@123"
}
```

#### Success Response (200)

```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": "uuid",
    "email": "user1@demo.com",
    "fullName": "Updated User Name",
    "role": "member",
    "tenantId": "uuid"
  }
}
```

***

### 3.4 Delete User

- **Method:** `DELETE`  
- **Endpoint:** `/users/:userId`  
- **Authentication:** Required  

#### Path Parameters

- `userId` (string, required)

#### Example

```http
DELETE /api/users/907c7ef1-1234-5678-9999-abcdefabcdef
Authorization: Bearer <JWT_TOKEN>
```

#### Success Response (200)

```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

***

## 4. Project Management APIs

### 4.1 Create Project

- **Method:** `POST`  
- **Endpoint:** `/projects`  
- **Authentication:** Required  

#### Request Body

```json
{
  "name": "Website Redesign",
  "description": "Revamp the marketing website",
  "startDate": "2025-01-01",
  "endDate": "2025-03-31",
  "status": "active"
}
```

#### Success Response (201)

```json
{
  "success": true,
  "message": "Project created successfully",
  "data": {
    "id": "uuid",
    "name": "Website Redesign",
    "description": "Revamp the marketing website",
    "startDate": "2025-01-01",
    "endDate": "2025-03-31",
    "status": "active",
    "tenantId": "uuid",
    "createdAt": "timestamp"
  }
}
```

***

### 4.2 List Projects

- **Method:** `GET`  
- **Endpoint:** `/projects`  
- **Authentication:** Required  

#### Query Parameters (optional)

- `status` (string, e.g., `active`, `completed`, `archived`)  
- `page` (number)  
- `limit` (number)

#### Example

```http
GET /api/projects?status=active&page=1&limit=10
Authorization: Bearer <JWT_TOKEN>
```

#### Success Response (200)

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Website Redesign",
      "description": "Revamp the marketing website",
      "status": "active",
      "startDate": "2025-01-01",
      "endDate": "2025-03-31",
      "tenantId": "uuid",
      "createdAt": "timestamp"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 1
  }
}
```

***

### 4.3 Update Project

- **Method:** `PUT`  
- **Endpoint:** `/projects/:projectId`  
- **Authentication:** Required  

#### Path Parameters

- `projectId` (string, required)

#### Request Body

```json
{
  "name": "Website Redesign v2",
  "description": "Revamp website with new branding",
  "status": "active",
  "startDate": "2025-01-10",
  "endDate": "2025-04-15"
}
```

#### Success Response (200)

```json
{
  "success": true,
  "message": "Project updated successfully",
  "data": {
    "id": "uuid",
    "name": "Website Redesign v2",
    "description": "Revamp website with new branding",
    "status": "active",
    "startDate": "2025-01-10",
    "endDate": "2025-04-15",
    "tenantId": "uuid",
    "updatedAt": "timestamp"
  }
}
```

***

### 4.4 Delete Project

- **Method:** `DELETE`  
- **Endpoint:** `/projects/:projectId`  
- **Authentication:** Required  

#### Path Parameters

- `projectId` (string, required)

#### Example

```http
DELETE /api/projects/62e9f0e1-1234-5678-9999-abcdefabcdef
Authorization: Bearer <JWT_TOKEN>
```

#### Success Response (200)

```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```

***

## 5. Task Management APIs

### 5.1 Create Task

- **Method:** `POST`  
- **Endpoint:** `/projects/:projectId/tasks`  
- **Authentication:** Required  

#### Path Parameters

- `projectId` (string, required)

#### Request Body

```json
{
  "title": "Design homepage",
  "description": "Create wireframes and final UI for homepage",
  "assigneeId": "uuid",
  "status": "todo",
  "priority": "high",
  "dueDate": "2025-01-15"
}
```

#### Success Response (201)

```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "id": "uuid",
    "projectId": "uuid",
    "title": "Design homepage",
    "description": "Create wireframes and final UI for homepage",
    "assigneeId": "uuid",
    "status": "todo",
    "priority": "high",
    "dueDate": "2025-01-15",
    "createdAt": "timestamp"
  }
}
```

***

### 5.2 List Project Tasks

- **Method:** `GET`  
- **Endpoint:** `/projects/:projectId/tasks`  
- **Authentication:** Required  

#### Path Parameters

- `projectId` (string, required)

#### Query Parameters (optional)

- `status` (string, e.g., `todo`, `in_progress`, `done`)  
- `assigneeId` (string)

#### Example

```http
GET /api/projects/62e9f0e1-1234-5678-9999-abcdefabcdef/tasks?status=todo
Authorization: Bearer <JWT_TOKEN>
```

#### Success Response (200)

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "projectId": "uuid",
      "title": "Design homepage",
      "description": "Create wireframes and final UI for homepage",
      "assigneeId": "uuid",
      "status": "todo",
      "priority": "high",
      "dueDate": "2025-01-15",
      "createdAt": "timestamp"
    }
  ]
}
```

***

### 5.3 Update Task Status

- **Method:** `PATCH`  
- **Endpoint:** `/tasks/:taskId/status`  
- **Authentication:** Required  

#### Path Parameters

- `taskId` (string, required)

#### Request Body

```json
{
  "status": "in_progress"
}
```

#### Success Response (200)

```json
{
  "success": true,
  "message": "Task status updated successfully",
  "data": {
    "id": "uuid",
    "projectId": "uuid",
    "title": "Design homepage",
    "status": "in_progress",
    "priority": "high",
    "dueDate": "2025-01-15",
    "updatedAt": "timestamp"
  }
}
```

***

### 5.4 Update Task

- **Method:** `PUT`  
- **Endpoint:** `/tasks/:taskId`  
- **Authentication:** Required  

#### Path Parameters

- `taskId` (string, required)

#### Request Body

```json
{
  "title": "Design homepage v2",
  "description": "Revise homepage design after feedback",
  "assigneeId": "uuid",
  "status": "in_progress",
  "priority": "medium",
  "dueDate": "2025-01-20"
}
```

#### Success Response (200)

```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": {
    "id": "uuid",
    "projectId": "uuid",
    "title": "Design homepage v2",
    "description": "Revise homepage design after feedback",
    "assigneeId": "uuid",
    "status": "in_progress",
    "priority": "medium",
    "dueDate": "2025-01-20",
    "updatedAt": "timestamp"
  }
}
```

***

## 6. Health Check API

### 6.1 Health Check

- **Method:** `GET`  
- **Endpoint:** `/health`  
- **Authentication:** Not required  

#### Example

```http
GET /api/health
```

#### Success Response (200)

```json
{
  "status": "ok",
  "database": "connected"
}
```

***
