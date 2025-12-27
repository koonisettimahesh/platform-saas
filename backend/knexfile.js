module.exports = {
  development: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST || 'database',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'saas_db',
      port: process.env.DB_PORT || 5432
    },
    migrations: {
      directory: './migrations'
    }
  }
};
