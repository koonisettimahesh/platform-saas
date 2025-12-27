# Research Document – Multi-Tenant SaaS Platform

## 1. Multi-Tenancy Analysis

### Introduction
Multi-tenancy is a core architectural concept in Software-as-a-Service (SaaS) applications where a single application instance serves multiple independent customers, known as tenants. Each tenant represents a separate organization with its own users, data, and configurations. A well-designed multi-tenant architecture ensures strong data isolation, security, scalability, and cost efficiency while maintaining shared infrastructure.

Choosing the correct multi-tenancy approach is critical because it affects system performance, operational complexity, scalability, and security. This section analyzes three commonly used multi-tenancy approaches and justifies the selected approach for this project.

---

### Comparison of Multi-Tenancy Approaches

| Approach | Description | Pros | Cons |
|--------|------------|------|------|
| **Shared Database + Shared Schema** | All tenants share the same database and tables, differentiated using a `tenant_id` column | Cost-effective, simple setup, easy migrations | Risk of data leakage if tenant filtering is missed |
| **Shared Database + Separate Schema** | Single database with a separate schema for each tenant | Better isolation than shared schema | Complex schema management and migrations |
| **Separate Database per Tenant** | Each tenant has its own dedicated database | Strongest isolation and security | High operational cost and management overhead |

---

### Shared Database + Shared Schema (tenant_id)
In this approach, all tenants use the same database and schema. Every table contains a `tenant_id` column that uniquely identifies the tenant owning the data. Application-level logic ensures that all queries are filtered using the tenant identifier.

**Advantages:**
- Lowest infrastructure and operational cost
- Simplified deployment and Docker configuration
- Centralized schema migrations
- Easy scalability for small and medium SaaS platforms

**Disadvantages:**
- Requires strict enforcement of tenant filtering
- Potential risk of data leakage if queries are incorrectly written

This approach is commonly used by many modern SaaS platforms such as project management and collaboration tools.

---

### Shared Database + Separate Schema
In this approach, tenants share a single database, but each tenant has its own database schema. Tables are duplicated across schemas, providing better separation than a shared schema.

**Advantages:**
- Improved isolation between tenants
- Easier customization for tenant-specific needs

**Disadvantages:**
- Complex schema creation and migration management
- Difficult to scale when the number of tenants increases
- Higher operational overhead compared to shared schema

---

### Separate Database per Tenant
In this approach, each tenant operates on its own independent database instance.

**Advantages:**
- Maximum data isolation and security
- Suitable for strict regulatory compliance

**Disadvantages:**
- Very high infrastructure and maintenance costs
- Complex database provisioning and connection management
- Not suitable for rapid tenant onboarding

This model is usually adopted by enterprise systems with strict compliance and security requirements.

---

### Chosen Approach Justification
**Chosen Approach: Shared Database + Shared Schema with `tenant_id`**

This project adopts the Shared Database + Shared Schema approach because:
- It aligns well with the assignment scope and timeline
- It simplifies Docker-based deployment
- It enables efficient resource utilization
- It allows easy database migrations and backups
- It scales well for small to medium-sized SaaS platforms

Strict middleware enforcement and consistent query filtering ensure proper data isolation and security.

---

## 2. Technology Stack Justification

### Backend Framework – Node.js with Express.js
Node.js with Express.js is chosen for backend development due to its non-blocking, event-driven architecture. Express provides a minimal and flexible framework for building RESTful APIs efficiently.

**Alternatives considered:** Django, Spring Boot  
Node.js was selected for its simplicity, performance, and strong ecosystem support.

---

### Frontend Framework – React
React is used to build the frontend as a single-page application. Its component-based structure enables efficient UI rendering, easy state management, and role-based feature control.

**Alternatives considered:** Angular, Vue.js  
React was chosen for its flexibility, popularity, and large developer community.

---

### Database – PostgreSQL
PostgreSQL is selected as the database due to its strong ACID compliance, support for relational integrity, foreign key constraints, indexing, and JSON capabilities.

**Alternatives considered:** MySQL, MongoDB  
PostgreSQL was preferred for its reliability and advanced querying features.

---

### Authentication – JWT with bcrypt
JWT (JSON Web Tokens) is used for stateless authentication, making the system scalable and efficient. bcrypt is used for password hashing with salting to protect against brute-force and rainbow table attacks.

**Alternatives considered:** Session-based authentication, OAuth  
JWT was chosen for its simplicity and suitability for API-driven architectures.

---

### Deployment – Docker and Docker Compose
Docker ensures consistent environments across development and deployment. Docker Compose enables one-command startup of database, backend, and frontend services.

**Alternatives considered:** Manual deployment, Kubernetes  
Docker Compose was selected to meet assignment requirements and simplify setup.

---

## 3. Security Considerations

### 1. Data Isolation
All database tables include a `tenant_id` column. Queries are always filtered by tenant_id, and indexes are applied to improve performance and enforce isolation.

---

### 2. Authentication and Authorization
JWT-based authentication is implemented with a 24-hour token expiry. Role-Based Access Control (RBAC) ensures that users can only access resources permitted by their role.

---

### 3. Password Hashing Strategy
All passwords are securely hashed using bcrypt with salting before being stored in the database. Plain-text passwords are never stored or logged.

---

### 4. API Security Measures
APIs implement authentication middleware, role checks, input validation, and proper HTTP status codes to prevent unauthorized access.

---

### 5. Environment Variables and Secrets Management
Sensitive configuration such as database credentials and JWT secrets are stored in environment variables. No sensitive data is hardcoded in the source code.