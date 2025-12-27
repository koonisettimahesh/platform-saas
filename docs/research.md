# Research Document – Multi-Tenant SaaS Platform

---

## 1. Multi-Tenancy Analysis

### Introduction
Multi-tenancy is a core concept in SaaS where a single application instance serves multiple independent customers, called tenants. Each tenant has its own users, data, and configurations. A proper multi-tenant architecture ensures **data isolation, security, scalability, and cost efficiency**.

Choosing the right approach impacts performance, operational complexity, scalability, and security. This section compares three common approaches and explains the chosen approach for this project.

---

### Comparison of Multi-Tenancy Approaches

| Approach | Description | Pros | Cons |
|----------|------------|------|------|
| **Shared DB + Shared Schema** | All tenants share the same database and tables; distinguished using `tenant_id` | Cost-effective, simple setup, easy migrations | Risk of data leakage if tenant filtering is missed |
| **Shared DB + Separate Schema** | Single database, separate schema per tenant | Better isolation than shared schema | Complex schema management and migrations |
| **Separate DB per Tenant** | Each tenant has a dedicated database | Maximum isolation and security | High operational cost and management overhead |

---

### Shared Database + Shared Schema (`tenant_id`)
- **Advantages:**
  - Lowest infrastructure and operational cost
  - Simplified deployment and Docker setup
  - Centralized schema migrations
  - Easy scalability for small/medium SaaS
- **Disadvantages:**
  - Requires strict tenant filtering
  - Potential data leakage if queries are incorrect

This approach is common in modern SaaS platforms like project management tools.

---

### Shared Database + Separate Schema
- **Advantages:**
  - Improved tenant isolation
  - Easier tenant-specific customization
- **Disadvantages:**
  - Complex schema management
  - Harder to scale with many tenants
  - Higher operational overhead

---

### Separate Database per Tenant
- **Advantages:**
  - Maximum isolation and security
  - Suitable for strict regulatory requirements
- **Disadvantages:**
  - High infrastructure and maintenance costs
  - Complex database provisioning
  - Not ideal for rapid onboarding

---

### Chosen Approach
**Shared Database + Shared Schema with `tenant_id`**

**Reasons:**
- Fits assignment scope and timeline
- Simplifies Docker-based deployment
- Efficient resource usage
- Easy migrations and backups
- Scales well for small to medium SaaS platforms

Strict middleware enforcement ensures proper data isolation and security.

---

## 2. Technology Stack Justification

### Backend Framework – Node.js + Express
- Non-blocking, event-driven architecture
- Minimal and flexible for REST APIs  
**Alternatives considered:** Django, Spring Boot  

### Frontend Framework – React
- Component-based SPA for efficient UI and state management  
**Alternatives considered:** Angular, Vue.js  

### Database – PostgreSQL
- Strong ACID compliance, foreign key constraints, JSON support  
**Alternatives considered:** MySQL, MongoDB  

### Authentication – JWT + bcrypt
- Stateless JWT authentication for scalability
- Passwords hashed with bcrypt  
**Alternatives considered:** Session-based auth, OAuth  

### Deployment – Docker + Docker Compose
- Consistent environments
- One-command startup for backend, frontend, and database  
**Alternatives considered:** Manual deployment, Kubernetes  

---

## 3. Security Considerations

### 3.1 Data Isolation
- All tables include `tenant_id`
- Queries filtered by tenant
- Indexes applied for performance

### 3.2 Authentication & Authorization
- JWT tokens (24-hour expiry)
- Role-Based Access Control (RBAC)

### 3.3 Password Hashing
- bcrypt with salting
- No plain-text passwords stored

### 3.4 API Security
- Authentication middleware
- Role checks
- Input validation and proper HTTP status codes

### 3.5 Environment Variables
- Database credentials and JWT secrets stored securely
- No sensitive data hardcoded
