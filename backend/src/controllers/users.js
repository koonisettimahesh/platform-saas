const bcrypt = require("bcrypt");
const { v4: uuid } = require("uuid");
const knex = require("../utils/db");

/**
 * ADD USER TO TENANT
 */
exports.addUserToTenant = async (req, res, next) => {
  try {
    const { tenantId } = req.params;
    const { email, password, fullName, role = "user" } = req.body;
    const currentUser = req.user;

    // 🔐 Authorization
    if (
      currentUser.role !== "tenant_admin" ||
      currentUser.tenantId !== tenantId
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    // 🚫 Prevent illegal role creation
    if (role === "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Cannot create super admin",
      });
    }

    // (Optional but recommended)
    if (role === "tenant_admin") {
      return res.status(403).json({
        success: false,
        message: "Only super admin can create tenant admins",
      });
    }

    // 🔑 Password required
    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required",
      });
    }

    // 🔢 Subscription limit check
    const tenant = await knex("tenants").where({ id: tenantId }).first();

    const [{ count }] = await knex("users")
      .where({ tenant_id: tenantId })
      .count();

    if (Number(count) >= tenant.max_users) {
      return res.status(403).json({
        success: false,
        message: "Subscription limit reached",
      });
    }

    // 📧 Unique email per tenant
    const existing = await knex("users")
      .where({ tenant_id: tenantId, email: email.toLowerCase() })
      .first();

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Email already exists in this tenant",
      });
    }

    // 🔐 Create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuid();
    const now = new Date();

    await knex("users").insert({
      id: userId,
      tenant_id: tenantId,
      email: email.toLowerCase(),
      password_hash: hashedPassword,
      full_name: fullName,
      role,
      is_active: true,
      created_at: now,
    });

    // 📝 Audit log
    await knex("audit_logs").insert({
      id: uuid(),
      user_id: currentUser.id,
      tenant_id: tenantId,
      action: "CREATE_USER",
      entity_type: "user",
      entity_id: userId,
      created_at: now,
    });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        id: userId,
        email: email.toLowerCase(),
        fullName,
        role,
        tenantId,
        isActive: true,
        createdAt: now,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * LIST TENANT USERS
 */
exports.listTenantUsers = async (req, res, next) => {
  try {
    const { tenantId } = req.params;
    const user = req.user;

    if (user.tenantId !== tenantId && user.role !== "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    const { search, role, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const query = knex("users")
      .where("tenant_id", tenantId)
      .select(
        "id",
        "email",
        "full_name as fullName",
        "role",
        "is_active as isActive",
        "created_at as createdAt"
      );

    if (role) query.andWhere("role", role);

    if (search) {
      query.andWhere((builder) =>
        builder
          .whereILike("email", `%${search}%`)
          .orWhereILike("full_name", `%${search}%`)
      );
    }

    // 🔢 COUNT QUERY (separate, NO select columns)
    const [{ count }] = await knex("users")
      .where("tenant_id", tenantId)
      .modify((q) => {
        if (role) q.andWhere("role", role);
        if (search) {
          q.andWhere((builder) =>
            builder
              .whereILike("email", `%${search}%`)
              .orWhereILike("full_name", `%${search}%`)
          );
        }
      })
      .count();

    // 📄 DATA QUERY (with select)
    const users = await knex("users")
      .where("tenant_id", tenantId)
      .modify((q) => {
        if (role) q.andWhere("role", role);
        if (search) {
          q.andWhere((builder) =>
            builder
              .whereILike("email", `%${search}%`)
              .orWhereILike("full_name", `%${search}%`)
          );
        }
      })
      .select(
        "id",
        "email",
        "full_name as fullName",
        "role",
        "is_active as isActive",
        "created_at as createdAt"
      )
      .orderBy("created_at", "desc")
      .limit(limit)
      .offset(offset);

    res.json({
      success: true,
      data: {
        users,
        total: Number(count),
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(count / limit),
          limit: Number(limit),
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * UPDATE USER
 */
exports.updateUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { fullName, role, isActive } = req.body;
    const currentUser = req.user;

    const targetUser = await knex("users").where({ id: userId }).first();
    if (!targetUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (targetUser.tenant_id !== currentUser.tenantId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const isSelf = currentUser.id === userId;
    const isTenantAdmin = currentUser.role === "tenant_admin";

    if (!isSelf && !isTenantAdmin) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    if ((role !== undefined || isActive !== undefined) && !isTenantAdmin) {
      return res.status(403).json({
        success: false,
        message: "Only tenant_admin can update role or status",
      });
    }

    // 🚫 Prevent removing last tenant_admin
    if (
      isTenantAdmin &&
      role &&
      role !== "tenant_admin" &&
      targetUser.role === "tenant_admin"
    ) {
      const [{ count }] = await knex("users")
        .where({
          tenant_id: currentUser.tenantId,
          role: "tenant_admin",
        })
        .count();

      if (Number(count) === 1) {
        return res.status(403).json({
          success: false,
          message: "Tenant must have at least one tenant admin",
        });
      }
    }

    const updateData = {};
    if (fullName !== undefined) updateData.full_name = fullName;
    if (isTenantAdmin && role !== undefined) updateData.role = role;
    if (isTenantAdmin && isActive !== undefined)
      updateData.is_active = isActive;
    updateData.updated_at = new Date();

    await knex("users").where({ id: userId }).update(updateData);

    await knex("audit_logs").insert({
      id: uuid(),
      user_id: currentUser.id,
      tenant_id: currentUser.tenantId,
      action: "UPDATE_USER",
      entity_type: "user",
      entity_id: userId,
      created_at: new Date(),
    });

    res.json({
      success: true,
      message: "User updated successfully",
      data: {
        id: userId,
        fullName: fullName ?? targetUser.full_name,
        role: role ?? targetUser.role,
        updatedAt: updateData.updated_at,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE USER
 */
exports.deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const currentUser = req.user;

    if (currentUser.role !== "tenant_admin") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    if (currentUser.id === userId) {
      return res.status(403).json({
        success: false,
        message: "Cannot delete self",
      });
    }

    const user = await knex("users").where({ id: userId }).first();
    if (!user || user.tenant_id !== currentUser.tenantId) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // 🚫 Prevent deleting last tenant_admin
    if (user.role === "tenant_admin") {
      const [{ count }] = await knex("users")
        .where({
          tenant_id: currentUser.tenantId,
          role: "tenant_admin",
        })
        .count();

      if (Number(count) === 1) {
        return res.status(403).json({
          success: false,
          message: "Cannot delete the last tenant admin",
        });
      }
    }

    await knex("users").where({ id: userId }).del();

    await knex("audit_logs").insert({
      id: uuid(),
      user_id: currentUser.id,
      tenant_id: currentUser.tenantId,
      action: "DELETE_USER",
      entity_type: "user",
      entity_id: userId,
      created_at: new Date(),
    });

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};
