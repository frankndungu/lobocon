import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { KsmmClause } from './entities/ksmm-clause.entity';

@Injectable()
export class KsmmClauseService {
  constructor(
    @InjectRepository(KsmmClause)
    private readonly clauseRepo: Repository<KsmmClause>,
  ) {}

  async findAll(): Promise<KsmmClause[]> {
    return this.clauseRepo.find({
      order: { section_code: 'ASC', section: 'ASC' },
    });
  }

  async findOne(id: number): Promise<KsmmClause | null> {
    return this.clauseRepo.findOne({ where: { id } });
  }

  async search(keyword: string): Promise<KsmmClause[]> {
    const trimmedKeyword = keyword.trim();

    // Check if it's a section code search (single letter like A, B, C)
    const isSectionCodeSearch = /^[A-Z]$/i.test(trimmedKeyword);

    if (isSectionCodeSearch) {
      // Search by section_code for exact matches like "A", "B", "C"
      return this.clauseRepo.find({
        where: { section_code: ILike(`${trimmedKeyword.toUpperCase()}%`) },
        order: { section: 'ASC' },
        take: 50,
      });
    }

    // Check if it's a detailed section search (like A1, B2, F16)
    const isSectionSearch = /^[A-Z]\d+$/i.test(trimmedKeyword);

    if (isSectionSearch) {
      return this.clauseRepo.find({
        where: { section: ILike(`${trimmedKeyword.toUpperCase()}%`) },
        order: { section: 'ASC' },
        take: 50,
      });
    }

    // General text search across all fields
    return this.clauseRepo.find({
      where: [
        { clause_title: ILike(`%${trimmedKeyword}%`) },
        { clause_reference: ILike(`%${trimmedKeyword}%`) },
        { contents: ILike(`%${trimmedKeyword}%`) },
        { section: ILike(`%${trimmedKeyword}%`) },
      ],
      order: { section_code: 'ASC', section: 'ASC' },
      take: 50,
    });
  }

  // New method to get all section codes for quick reference
  async getSectionCodes(): Promise<string[]> {
    const result = await this.clauseRepo
      .createQueryBuilder('clause')
      .select('DISTINCT clause.section_code', 'section_code')
      .orderBy('clause.section_code', 'ASC')
      .getRawMany();

    return result.map((r) => r.section_code);
  }
}
