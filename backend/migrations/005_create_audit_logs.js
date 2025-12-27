exports.up = function (knex) {
  return knex.schema.createTable('audit_logs', table => {
    table.uuid('id').primary();

    table.uuid('tenant_id')
      .references('id')
      .inTable('tenants')
      .onDelete('CASCADE');

    table.uuid('user_id')
      .references('id')
      .inTable('users')
      .onDelete('SET NULL');

    table.string('action').notNullable();
    table.string('entity_type');
    table.string('entity_id');
    table.string('ip_address');

    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('audit_logs');
};
