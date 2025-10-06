import 'dotenv/config';
import { prisma } from '@lobocon/prisma-client';
import * as bcrypt from 'bcrypt';

async function main() {
  console.log('Creating test company and user...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  const company = await prisma.company.create({
    data: {
      name: 'Mjenzi Construction Ltd',
      email: 'info@mjenzi.co.ke',
      phone: '+254712345678',
    },
  });

  console.log('✓ Created company:', company.name);

  const user = await prisma.user.create({
    data: {
      email: 'boni@mjenzi.co.ke',
      password: hashedPassword,
      firstName: 'Boni',
      lastName: 'Mjenzi',
      role: 'OWNER',
      companyId: company.id,
    },
  });

  console.log('✓ Created user:', user.email);
  console.log('\nTest Credentials:');
  console.log('Email:', user.email);
  console.log('Password: password123');
  console.log('\nCompany ID:', company.id);
  console.log('User ID:', user.id);
}

main()
  .catch((e) => {
    console.error('Error creating test data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
