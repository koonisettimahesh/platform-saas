exports.up = function (knex) {
  return knex.schema.createTable('users', table => {
    table.uuid('id').primary();

    table.uuid('tenant_id')
      .references('id')
      .inTable('tenants')
      .onDelete('CASCADE');

    table.string('email').notNullable();
    table.string('password_hash').notNullable();
    table.string('full_name').notNullable();

    table.enu('role', ['super_admin', 'tenant_admin', 'user']).notNullable();
    table.boolean('is_active').defaultTo(true);

    table.timestamps(true, true);

    table.unique(['tenant_id', 'email']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('users');
};
