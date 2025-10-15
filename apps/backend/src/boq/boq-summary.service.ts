import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BoqSummary } from '../entities/boq-summary.entity';
import { Boq } from '../entities/boq.entity';

@Injectable()
export class BoqSummaryService {
  constructor(
    @InjectRepository(BoqSummary)
    private readonly summaryRepo: Repository<BoqSummary>,

    @InjectRepository(Boq)
    private readonly boqRepo: Repository<Boq>,
  ) {}

  // ✅ Get all summaries (optionally filtered by project)
  async findAll(project_id?: string): Promise<BoqSummary[]> {
    const query = this.summaryRepo
      .createQueryBuilder('summary')
      .leftJoinAndSelect('summary.items', 'items')
      .leftJoinAndSelect('summary.project', 'project');

    if (project_id) {
      query.where('summary.project_id = :project_id', { project_id });
    }

    return query.getMany();
  }

  // ✅ Get a single summary by ID
  async findOne(id: number): Promise<BoqSummary | null> {
    return this.summaryRepo.findOne({
      where: { id },
      relations: ['items', 'project'],
    });
  }

  // ✅ Create a new summary
  async create(data: Partial<BoqSummary>): Promise<BoqSummary> {
    const summary = this.summaryRepo.create(data);
    return this.summaryRepo.save(summary);
  }

  // ✅ Update a summary
  async update(
    id: number,
    data: Partial<BoqSummary>,
  ): Promise<BoqSummary | null> {
    await this.summaryRepo.update(id, data);
    return this.findOne(id);
  }

  // ✅ Delete a summary
  async remove(id: number): Promise<void> {
    await this.summaryRepo.delete(id);
  }

  // ✅ Recalculate total amount for a summary (called by BoQ service too)
  async updateTotalAmount(summary_id: number): Promise<void> {
    const items = await this.boqRepo.find({ where: { summary_id } });
    const total = items.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0,
    );

    await this.summaryRepo.update(summary_id, { total_amount: total });
  }
}
