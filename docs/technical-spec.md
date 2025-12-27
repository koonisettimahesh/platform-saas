# Technical Specification
## Multi-Tenant SaaS Platform – Project & Task Management System

---

## 1. Project Structure

The project follows a clear separation of concerns by organizing backend, frontend, and documentation into dedicated directories. This structure improves maintainability, scalability, and collaboration.

---

### 1.1 Backend Folder Structure

**Folder Descriptions: backend/src/**

- **controllers/**  
  Contains request-handling logic for APIs. Controllers receive requests, apply business logic, and return responses.

- **routes/**  
  Defines API endpoints and maps them to corresponding controllers.

- **middleware/**  
  Contains reusable middleware such as authentication, role-based access control (RBAC), and error handling.

- **models/**  
  Defines database models and ORM schemas representing tables such as users, tenants, projects, and tasks.

- **utils/**  
  Holds utility functions such as token generation, password hashing, and helper methods.

- **config/**  
  Contains configuration files for database connection, environment variables, and application settings.

- **migrations/**  
  Stores database migration and seed files for automatic schema creation and initial data setup.

- **tests/**  
  Contains unit and integration tests for backend APIs.

---

### 1.2 Frontend Folder Structure

**Folder Descriptions: frontend/src/**

- **pages/**  
  Contains main application pages such as Login, Dashboard, Projects, and Users.

- **components/**  
  Reusable UI components like forms, tables, buttons, and modals.

- **services/**  
  Handles API communication with the backend using HTTP clients.

- **context/**  
  Manages global application state such as authentication and user data.

- **routes/**  
  Defines protected and public routes for the application.

- **styles/**  
  Contains global and component-level styling files.

- **public/**  
  Stores static assets such as images and icons.

---

## 2. Development Setup Guide

### 2.1 Prerequisites

Ensure the following tools are installed on the system:

- Node.js (v18 or above)
- npm (comes with Node.js)
- Docker
- Docker Compose
- Git

---

### 2.2 Environment Variables

The application uses environment variables for configuration. These variables are defined in a `.env` file at the project root or directly in `docker-compose.yml`.

**Required Variables:**

- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `JWT_SECRET`
- `JWT_EXPIRY`
- `NODE_ENV`

All environment variables use development or test values and are committed for evaluation purposes.

---

### 2.3 Installation Steps

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd multi-tenant-saas
   
2. Install backend dependencies:

   cd backend
   npm install

3. Install frontend dependencies:

   cd ../frontend
   npm install

### 2.4 Running the Application Locally

The application is fully containerized and can be started using Docker Compose.

    docker-compose up -d


This command starts:

 - PostgreSQL database on port 5432

 - Backend API server on port 5000

 - Frontend React application on port 3000

### 2.5 Running Tests

Backend Tests
   cd backend
   npm test

Frontend Tests
  cd frontend
  npm test