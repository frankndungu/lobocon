import { DataSource } from 'typeorm';
import { KsmmClause } from '../entities/ksmm-clause.entity';
import * as fs from 'fs';
import * as path from 'path';
import csvParser from 'csv-parser';

interface KsmmClauseRow {
  section_code: string;
  section: string;
  contents: string;
  clause_title: string;
  clause_reference: string;
}

async function parseCsvFile(filePath: string): Promise<KsmmClauseRow[]> {
  return new Promise((resolve, reject) => {
    const results: KsmmClauseRow[] = [];

    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (row: any) => {
        // Validate and map CSV row to typed interface
        const mappedRow: KsmmClauseRow = {
          section_code: row.section_code?.trim() || '',
          section: row.section?.trim() || '',
          contents: row.contents?.trim() || '',
          clause_title: row.clause_title?.trim() || '',
          clause_reference: row.clause_reference?.trim() || '',
        };
        results.push(mappedRow);
      })
      .on('end', () => {
        console.log(`✓ Parsed ${results.length} rows from CSV`);
        resolve(results);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

export async function seedKsmmClauses(dataSource: DataSource): Promise<void> {
  const repository = dataSource.getRepository(KsmmClause);

  try {
    console.log('Starting KSMM Clauses seeding...');

    // Check if data already exists
    const existingCount = await repository.count();
    if (existingCount > 0) {
      console.log(`⚠ Database already contains ${existingCount} KSMM clauses`);
      const shouldClear = process.env.FORCE_SEED === 'true';

      if (shouldClear) {
        console.log('🗑 Clearing existing data...');
        await repository.clear();
      } else {
        console.log(
          'ℹ Skipping seed. Set FORCE_SEED=true to clear and re-seed',
        );
        return;
      }
    }

    // Parse CSV file
    const csvPath = path.join(__dirname, '../data/ksmm_clauses_proper.csv');

    if (!fs.existsSync(csvPath)) {
      throw new Error(`CSV file not found at: ${csvPath}`);
    }

    const rows = await parseCsvFile(csvPath);

    if (rows.length === 0) {
      console.warn('⚠ No data found in CSV file');
      return;
    }

    // Validate data
    const invalidRows = rows.filter(
      (row) =>
        !row.section_code || !row.section || !row.contents || !row.clause_title,
    );

    if (invalidRows.length > 0) {
      console.warn(
        `⚠ Found ${invalidRows.length} rows with missing required fields`,
      );
    }

    // Insert data in batches for better performance
    const batchSize = 100;
    let insertedCount = 0;

    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      const entities = batch.map((row) =>
        repository.create({
          section_code: row.section_code,
          section: row.section,
          contents: row.contents,
          clause_title: row.clause_title,
          clause_reference: row.clause_reference,
        }),
      );

      await repository.save(entities);
      insertedCount += entities.length;
      console.log(`  Inserted batch: ${insertedCount}/${rows.length}`);
    }

    console.log(`✓ Successfully seeded ${insertedCount} KSMM clauses`);
  } catch (error) {
    console.error('✗ Error seeding KSMM clauses:', error);
    throw error;
  }
}
