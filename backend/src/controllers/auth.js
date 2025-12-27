const bcrypt = require("bcrypt");
const { v4: uuid } = require("uuid");
const knex = require("../utils/db");
const jwt = require("jsonwebtoken");

exports.registerTenant = async (req, res, next) => {
  const { tenantName, subdomain, adminEmail, adminPassword, adminFullName } =
    req.body;

  if (
    !tenantName ||
    !subdomain ||
    !adminEmail ||
    !adminPassword ||
    !adminFullName
  ) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  try {
    await knex.transaction(async (trx) => {
      // Check if subdomain or email exists
      const existingTenant = await trx("tenants").where({ subdomain }).first();
      const existingUser = await trx("users")
        .where({ email: adminEmail })
        .first();

      if (existingTenant || existingUser) {
        return res.status(409).json({
          success: false,
          message: "Subdomain or email already exists",
        });
      }

      // Create tenant
      const tenantId = uuid();
      await trx("tenants").insert({
        id: tenantId,
        name: tenantName,
        subdomain,
        status: "active",
        subscription_plan: "free", // default
        max_users: 5,
        max_projects: 10,
      });

      // Create tenant admin
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      const adminId = uuid();

      await trx("users").insert({
        id: adminId,
        tenant_id: tenantId,
        email: adminEmail,
        password_hash: hashedPassword,
        full_name: adminFullName,
        role: "tenant_admin",
        is_active: true,
      });

      res.status(201).json({
        success: true,
        message: "Tenant registered successfully",
        data: {
          tenantId,
          subdomain,
          adminUser: {
            id: adminId,
            email: adminEmail,
            fullName: adminFullName,
            role: "tenant_admin",
          },
        },
      });
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  const { email, password, tenantSubdomain, tenantId } = req.body;

  try {
    let user;
    let tenant = null;

    // 🔑 SUPER ADMIN LOGIN (NO TENANT)
    if (!tenantSubdomain) {
      user = await knex("users").where({ email, role: "super_admin" }).first();

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }
    }
    // 🏢 TENANT USER LOGIN
    else {
      if (!tenantSubdomain && !tenantId) {
        return res.status(400).json({
          success: false,
          message: "tenantSubdomain or tenantId is required",
        });
      }

      tenant = tenantSubdomain
        ? await knex("tenants").where({ subdomain: tenantSubdomain }).first()
        : await knex("tenants").where({ id: tenantId }).first();

      if (!tenant) {
        return res.status(404).json({
          success: false,
          message: "Tenant not found",
        });
      }

      if (tenant.status !== "active") {
        return res.status(403).json({
          success: false,
          message: "Tenant is not active",
        });
      }

      user = await knex("users").where({ email, tenant_id: tenant.id }).first();

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }
    }

    if (user.is_active === false) {
      return res.status(403).json({
        success: false,
        message: "Account is inactive",
      });
    }
    if (user.role === "super_admin" && tenantSubdomain) {
      return res.status(400).json({
        success: false,
        message: "Super admin must login without tenantSubdomain",
      });
    }

    if (user.role !== "super_admin" && !tenantSubdomain) {
      return res.status(400).json({
        success: false,
        message: "Tenant users must login with tenantSubdomain",
      });
    }
    // 🔐 Password check
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // 🎫 JWT
    const token = jwt.sign(
      {
        userId: user.id,
        tenantId: tenant ? tenant.id : null,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
          tenantId: tenant ? tenant.id : null,
        },
        token,
        expiresIn: 86400,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.me = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Token invalid or expired",
    });
  }

  const user = req.user;

  return res.status(200).json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      isActive: true,
      tenant: user.tenant
        ? {
            id: user.tenant.id,
            name: user.tenant.name,
            subdomain: user.tenant.subdomain,
            subscriptionPlan: user.tenant.subscriptionPlan,
            maxUsers: user.tenant.maxUsers,
            maxProjects: user.tenant.maxProjects,
          }
        : null,
    },
  });
};

exports.logout = async (req, res) => {
  try {
    if (req.user) {
      await knex("audit_logs").insert({
        id: uuid(),
        user_id: req.user.id,
        tenant_id: req.user.tenantId,
        action: "LOGOUT",
        entity_type: "auth",
        entity_id: req.user.id,
        created_at: new Date(),
      });
    }
  } catch (err) {
    // ignore logging errors
  }

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

