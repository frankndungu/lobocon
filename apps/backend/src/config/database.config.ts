import { registerAs } from '@nestjs/config';

export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

export default registerAs('database', (): DatabaseConfig => {
  // Environment variables are already loaded by ConfigModule in app.module.ts
  const host = process.env.DB_HOST;
  const port = process.env.DB_PORT;
  const username = process.env.DB_USERNAME;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME;

  // Validate required fields
  if (!username) {
    throw new Error('DB_USERNAME is required');
  }
  if (!password) {
    throw new Error('DB_PASSWORD is required');
  }
  if (!database) {
    throw new Error('DB_NAME is required');
  }

  return {
    host: host || 'localhost',
    port: port ? parseInt(port, 10) : 5432,
    username,
    password,
    database,
  };
});
