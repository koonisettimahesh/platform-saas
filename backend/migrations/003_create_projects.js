exports.up = function (knex) {
  return knex.schema.createTable('projects', table => {
    table.uuid('id').primary();

    table.uuid('tenant_id')
      .references('id')
      .inTable('tenants')
      .onDelete('CASCADE');

    table.string('name').notNullable();
    table.text('description');

    table.enu('status', ['active', 'archived', 'completed']).notNullable();

    table.uuid('created_by')
      .references('id')
      .inTable('users')
      .onDelete('SET NULL');

    table.timestamps(true, true);

    table.index(['tenant_id']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('projects');
};
