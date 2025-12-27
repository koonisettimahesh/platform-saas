exports.up = function (knex) {
  return knex.schema.createTable('tasks', table => {
    table.uuid('id').primary();

    table.uuid('tenant_id')
      .references('id')
      .inTable('tenants')
      .onDelete('CASCADE');

    table.uuid('project_id')
      .references('id')
      .inTable('projects')
      .onDelete('CASCADE');

    table.string('title').notNullable();
    table.text('description');

    table.enu('status', ['todo', 'in_progress', 'completed']).notNullable();
    table.enu('priority', ['low', 'medium', 'high']).notNullable();

    table.uuid('assigned_to')
      .references('id')
      .inTable('users')
      .onDelete('SET NULL');

    table.date('due_date');

    table.timestamps(true, true);

    table.index(['tenant_id', 'project_id']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('tasks');
};
