import { PrismaClient } from '../generated/prisma';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Read KSMM CSV file
  const csvPath = path.join(__dirname, '../data/ksmm_clauses_proper.csv');

  console.log('Reading CSV from:', csvPath);

  const fileContent = fs.readFileSync(csvPath, 'utf-8');

  interface KSMMRecord {
    section_code: string;
    section: string;
    contents: string;
    clause_title: string;
    clause_reference: string;
  }

  const records = parse<KSMMRecord>(fileContent, {
    columns: true,
    skip_empty_lines: true,
  });

  console.log(`Found ${records.length} KSMM clauses`);

  // Insert KSMM clauses
  let count = 0;
  for (const record of records) {
    await prisma.kSMMClause.create({
      data: {
        sectionCode: record.section_code,
        section: record.section,
        contents: record.contents,
        clauseTitle: record.clause_title,
        clauseReference: record.clause_reference,
      },
    });
    count++;

    // Show progress every 50 records
    if (count % 50 === 0) {
      console.log(`Inserted ${count} clauses...`);
    }
  }

  console.log(`✓ Successfully seeded ${count} KSMM clauses`);
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
