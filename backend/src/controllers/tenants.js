const knex = require('../utils/db');
const { v4: uuid } = require('uuid');

exports.getTenantDetails = async (req, res, next) => {
  try {
    const { tenantId } = req.params;
    const user = req.user;

    // 🔐 Authorization check
    const isSameTenant = user.tenantId === tenantId;
    const isSuperAdmin = user.role === 'super_admin';

    if (!isSameTenant && !isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    // 🔎 Fetch tenant
    const tenant = await knex('tenants')
      .where({ id: tenantId })
      .first();

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found'
      });
    }

    // 📊 Stats calculations
    const [{ count: totalUsers }] = await knex('users')
      .where({ tenant_id: tenantId })
      .count();

    const [{ count: totalProjects }] = await knex('projects')
      .where({ tenant_id: tenantId })
      .count();

    const [{ count: totalTasks }] = await knex('tasks')
      .join('projects', 'tasks.project_id', 'projects.id')
      .where('projects.tenant_id', tenantId)
      .count();

    return res.status(200).json({
      success: true,
      data: {
        id: tenant.id,
        name: tenant.name,
        subdomain: tenant.subdomain,
        status: tenant.status,
        subscriptionPlan: tenant.subscription_plan,
        maxUsers: tenant.max_users,
        maxProjects: tenant.max_projects,
        createdAt: tenant.created_at,
        stats: {
          totalUsers: Number(totalUsers),
          totalProjects: Number(totalProjects),
          totalTasks: Number(totalTasks)
        }
      }
    });

  } catch (err) {
    next(err);
  }
};

exports.updateTenant = async (req, res, next) => {
  try {
    const { tenantId } = req.params;
    const user = req.user;
    const {
      name,
      status,
      subscriptionPlan,
      maxUsers,
      maxProjects
    } = req.body;

    // 🔐 Authorization
    const isTenantAdmin =
      user.role === 'tenant_admin' && user.tenantId === tenantId;
    const isSuperAdmin = user.role === 'super_admin';

    if (!isTenantAdmin && !isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    // 🚫 Tenant admin restrictions
    if (isTenantAdmin) {
      const forbiddenFields = [
        status,
        subscriptionPlan,
        maxUsers,
        maxProjects
      ];

      if (forbiddenFields.some(v => v !== undefined)) {
        return res.status(403).json({
          success: false,
          message: 'Tenant admin can only update name'
        });
      }
    }

    // 🔎 Check tenant exists
    const tenant = await knex('tenants')
      .where({ id: tenantId })
      .first();

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found'
      });
    }

    // 🧩 Build update payload dynamically
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (isSuperAdmin) {
      if (status !== undefined) updateData.status = status;
      if (subscriptionPlan !== undefined)
        updateData.subscription_plan = subscriptionPlan;
      if (maxUsers !== undefined) updateData.max_users = maxUsers;
      if (maxProjects !== undefined)
        updateData.max_projects = maxProjects;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    updateData.updated_at = new Date();

    // 📝 Update tenant
    await knex('tenants')
      .where({ id: tenantId })
      .update(updateData);

    // 📜 Audit log
    await knex('audit_logs').insert({
      id: uuid(),
      user_id: user.id,
      tenant_id: tenantId,
      action: 'UPDATE_TENANT',
      entity_type: 'tenant',
      entity_id: tenantId,
      //metadata: JSON.stringify(updateData),
      created_at: new Date()
    });

    return res.status(200).json({
      success: true,
      message: 'Tenant updated successfully',
      data: {
        id: tenantId,
        name: updateData.name || tenant.name,
        updatedAt: updateData.updated_at
      }
    });

  } catch (err) {
    next(err);
  }
};

exports.listTenants = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const offset = (page - 1) * limit;

    const { status, subscriptionPlan } = req.query;

    // Base query
    const baseQuery = knex('tenants')
      .leftJoin('users', 'tenants.id', 'users.tenant_id')
      .leftJoin('projects', 'tenants.id', 'projects.tenant_id');

    if (status) {
      baseQuery.where('tenants.status', status);
    }

    if (subscriptionPlan) {
      baseQuery.where('tenants.subscription_plan', subscriptionPlan);
    }

    // MAIN DATA QUERY
    const tenants = await baseQuery
      .select(
        'tenants.id',
        'tenants.name',
        'tenants.subdomain',
        'tenants.status',
        'tenants.subscription_plan as subscriptionPlan',
        'tenants.created_at as createdAt'
      )
      .countDistinct('users.id as totalUsers')
      .countDistinct('projects.id as totalProjects')
      .groupBy('tenants.id')
      .limit(limit)
      .offset(offset);

    // TOTAL COUNT (for pagination)
    const [{ count }] = await knex('tenants').count('*');

    res.json({
      success: true,
      data: {
        tenants,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(count / limit),
          totalTenants: parseInt(count),
          limit
        }
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

