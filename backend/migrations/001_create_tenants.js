exports.up = function (knex) {
  return knex.schema.createTable('tenants', table => {
    table.uuid('id').primary();
    table.string('name').notNullable();
    table.string('subdomain').notNullable().unique();

    table.enu('status', ['active', 'suspended', 'trial']).notNullable();
    table.enu('subscription_plan', ['free', 'pro', 'enterprise']).notNullable();

    table.integer('max_users').notNullable();
    table.integer('max_projects').notNullable();

    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('tenants');
};
