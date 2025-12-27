const jwt = require("jsonwebtoken");
const knex = require("../utils/db");

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await knex("users")
      .leftJoin("tenants", "users.tenant_id", "tenants.id")
      .select(
        "users.id",
        "users.email",
        "users.full_name",
        "users.role",
        "users.is_active",
        "tenants.id as tenant_id",
        "tenants.name as tenant_name",
        "tenants.subdomain",
        "tenants.subscription_plan",
        "tenants.max_users",
        "tenants.max_projects"
      )
      .where("users.id", decoded.userId)
      .first();

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: "Account inactive",
      });
    }

    req.user = {
      id: user.id,
      tenantId: user.tenant_id,
      role: user.role,
      email: user.email,
      fullName: user.full_name,
      tenant: {
        id: user.tenant_id,
        name: user.tenant_name,
        subdomain: user.subdomain,
        subscriptionPlan: user.subscription_plan,
        maxUsers: user.max_users,
        maxProjects: user.max_projects,
      },
    };

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Token invalid or expired",
    });
  }
};
