import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';
import { KsmmClause } from './ksmm-clauses/entities/ksmm-clause.entity';
import { seedKsmmClauses } from './seeds/seed-ksmm';

// Load environment variables from project root
// process.cwd() returns where the npm command is run from
config({ path: join(process.cwd(), '../../.env') });

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [KsmmClause],
  synchronize: true,
  logging: false,
});

// Validate environment variables before attempting connection
function validateEnvVars() {
  const required = ['DB_USERNAME', 'DB_PASSWORD', 'DB_NAME'];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
        `Make sure your .env file is at: ${join(process.cwd(), '../../.env')}`,
    );
  }
}

async function runSeeds() {
  console.log('🌱 Starting database seeding...\n');

  try {
    // Validate environment variables first
    validateEnvVars();

    // Initialize data source
    await AppDataSource.initialize();
    console.log('✓ Database connection established\n');

    // Run seeders
    await seedKsmmClauses(AppDataSource);

    console.log('\n✓ All seeds completed successfully');
  } catch (error) {
    console.error('\n✗ Seeding failed:', error);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
    console.log('\n✓ Database connection closed');
  }
}

runSeeds();
