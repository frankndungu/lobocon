import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { KsmmClause } from '../entities/ksmm-clause.entity';

@Injectable()
export class KsmmClauseService {
  constructor(
    @InjectRepository(KsmmClause)
    private readonly clauseRepo: Repository<KsmmClause>,
  ) {}

  async findAll(): Promise<KsmmClause[]> {
    return this.clauseRepo.find();
  }

  async findOne(id: number): Promise<KsmmClause | null> {
    return this.clauseRepo.findOne({ where: { id } });
  }

  async search(keyword: string): Promise<KsmmClause[]> {
    return this.clauseRepo.find({
      where: [
        { clause_title: ILike(`%${keyword}%`) },
        { clause_reference: ILike(`%${keyword}%`) },
        { contents: ILike(`%${keyword}%`) },
      ],
      take: 50, // limit results for performance
    });
  }
}
