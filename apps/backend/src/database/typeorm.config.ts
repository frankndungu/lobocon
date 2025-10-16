import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';

// Load environment variables from your .env file
config({ path: join(process.cwd(), '../../.env') });

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,

  // Entity paths - matches your app.module.ts pattern
  entities: ['src/**/*.entity{.ts,.js}'],

  // Migration configuration
  migrations: ['src/database/migrations/*{.ts,.js}'],

  // CLI configuration
  migrationsTableName: 'migrations',

  // Never use synchronize with migrations
  synchronize: false,
  logging: true,
});
