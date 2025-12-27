const { query } = require('./db');

module.exports = async (action, entityType, entityId, req = null) => {
  try {
    await query(
      `INSERT INTO audit_logs (tenant_id, user_id, action, entity_type, entity_id, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        req?.user?.tenantId,
        req?.user?.id,
        action,
        entityType,
        entityId,
        req?.ip || null
      ]
    );
  } catch (error) {
    console.error('Audit log failed:', error);
  }
};
