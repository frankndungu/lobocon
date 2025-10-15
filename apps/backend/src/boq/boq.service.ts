import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Boq } from '../entities/boq.entity';
import { BoqSummary } from '../entities/boq-summary.entity';

@Injectable()
export class BoqService {
  constructor(
    @InjectRepository(Boq)
    private readonly boqRepo: Repository<Boq>,

    @InjectRepository(BoqSummary)
    private readonly summaryRepo: Repository<BoqSummary>,
  ) {}

  // ✅ Get all BoQ items (optionally filter by project)
  async findAll(project_id?: string): Promise<Boq[]> {
    const query = this.boqRepo
      .createQueryBuilder('boq')
      .leftJoinAndSelect('boq.summary', 'summary')
      .leftJoinAndSelect('boq.project', 'project');

    if (project_id) {
      query.where('boq.project_id = :project_id', { project_id });
    }

    return query.getMany();
  }

  // ✅ Get single BoQ item
  async findOne(id: number): Promise<Boq | null> {
    return this.boqRepo.findOne({
      where: { id },
      relations: ['summary', 'project'],
    });
  }

  // ✅ Create BoQ item and auto-update section total
  async create(data: Partial<Boq>): Promise<Boq> {
    const boqItem = this.boqRepo.create(data);
    const saved = await this.boqRepo.save(boqItem);

    await this.updateSummaryTotal(saved.summary_id);
    return saved;
  }

  // ✅ Update BoQ item and recalc summary total
  async update(id: number, data: Partial<Boq>): Promise<Boq | null> {
    await this.boqRepo.update(id, data);
    const updated = await this.findOne(id);

    if (updated?.summary_id) {
      await this.updateSummaryTotal(updated.summary_id);
    }

    return updated;
  }

  // ✅ Delete BoQ item and adjust totals
  async remove(id: number): Promise<void> {
    const item = await this.findOne(id);

    if (item?.summary_id) {
      await this.boqRepo.delete(id);
      await this.updateSummaryTotal(item.summary_id);
    } else {
      await this.boqRepo.delete(id);
    }
  }

  // ✅ Helper — recalc total for a section/summary
  private async updateSummaryTotal(summary_id?: number): Promise<void> {
    if (!summary_id) return;

    const items = await this.boqRepo.find({ where: { summary_id } });
    const total = items.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0,
    );

    await this.summaryRepo.update(summary_id, { total_amount: total });
  }
}
