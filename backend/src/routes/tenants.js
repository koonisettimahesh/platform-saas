const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

const {
  listTenants,
  getTenantDetails,
  updateTenant
} = require('../controllers/tenants');

const {
  addUserToTenant,
  listTenantUsers
} = require('../controllers/users');

/* ============================
   TENANT ROUTES
============================ */

/**
 * GET /api/tenants
 * SUPER ADMIN ONLY
 * List all tenants with pagination, filtering, stats
 */
router.get(
  '/',
  authMiddleware,
  requireRole('super_admin'), // Only super_admin can list all tenants
  listTenants
);

/**
 * GET /api/tenants/:tenantId
 * TENANT ADMIN (own tenant) OR SUPER ADMIN
 * Get tenant details including stats
 */
router.get(
  '/:tenantId',
  authMiddleware, // Auth required
  getTenantDetails // Controller handles tenant_admin vs super_admin logic
);

/**
 * PUT /api/tenants/:tenantId
 * TENANT ADMIN (name only) OR SUPER ADMIN (all fields)
 * Update tenant info
 */
router.put(
  '/:tenantId',
  authMiddleware, // Auth required
  updateTenant // Controller handles role logic and restrictions
);

/**
 * POST /api/tenants/:tenantId/users
 * TENANT ADMIN ONLY
 * Add a new user to the tenant
 */
router.post(
  '/:tenantId/users',
  authMiddleware,
  requireRole('tenant_admin'), // Only tenant_admin can add users
  addUserToTenant
);

/**
 * GET /api/tenants/:tenantId/users
 * TENANT ADMIN (own tenant) OR SUPER ADMIN
 * List all users of a tenant
 */
router.get(
  '/:tenantId/users',
  authMiddleware,
  requireRole('tenant_admin', 'super_admin'), // Either tenant_admin or super_admin
  listTenantUsers
);

module.exports = router;
