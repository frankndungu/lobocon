import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item, ItemType } from '../entities/item.entity';
import { Section } from '../entities/section.entity';
import { SectionService } from './section.service';

@Injectable()
export class ItemService {
  constructor(
    @InjectRepository(Item)
    private readonly itemRepo: Repository<Item>,

    @InjectRepository(Section)
    private readonly sectionRepo: Repository<Section>,

    @Inject(forwardRef(() => SectionService))
    private readonly sectionService: SectionService,
  ) {}

  // ✅ Get all items with enhanced filtering
  async findAll(filters?: {
    project_id?: string;
    bill_id?: string;
    section_id?: string;
  }): Promise<Item[]> {
    const query = this.itemRepo
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.section', 'section')
      .leftJoinAndSelect('item.project', 'project')
      .leftJoinAndSelect('item.collections', 'collections')
      .leftJoinAndSelect('section.bill', 'bill');

    if (filters?.project_id) {
      query.andWhere('item.project_id = :project_id', {
        project_id: filters.project_id,
      });
    }

    if (filters?.section_id) {
      query.andWhere('item.section_id = :section_id', {
        section_id: filters.section_id,
      });
    }

    if (filters?.bill_id) {
      query.andWhere('bill.id = :bill_id', { bill_id: filters.bill_id });
    }

    return query
      .orderBy('section.sort_order', 'ASC')
      .addOrderBy('item.item_code', 'ASC')
      .getMany();
  }

  // ✅ Get single item with full relations
  async findOne(id: number): Promise<Item | null> {
    return this.itemRepo.findOne({
      where: { id },
      relations: ['section', 'project', 'collections', 'section.bill'],
    });
  }

  // 🆕 Find items by type (Measured, L Sum, PC Sum, etc.)
  async findByType(type: ItemType, project_id?: string): Promise<Item[]> {
    const query = this.itemRepo
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.section', 'section')
      .where('item.item_type = :type', { type });

    if (project_id) {
      query.andWhere('item.project_id = :project_id', { project_id });
    }

    return query.getMany();
  }

  // ✅ Create item and auto-update section totals
  async create(data: Partial<Item>): Promise<Item> {
    // Auto-calculate amount if not provided
    if (data.quantity && data.rate && !data.amount) {
      data.amount = Number(data.quantity) * Number(data.rate);
    }

    const item = this.itemRepo.create(data);
    const saved = await this.itemRepo.save(item);

    // Update section totals
    await this.updateSectionTotals(saved.section_id);
    return saved;
  }

  // ✅ Update item and recalculate totals
  async update(id: number, data: Partial<Item>): Promise<Item | null> {
    // Auto-calculate amount if quantity or rate changed
    if (data.quantity !== undefined || data.rate !== undefined) {
      const existing = await this.findOne(id);
      if (existing) {
        const quantity = data.quantity ?? existing.quantity;
        const rate = data.rate ?? existing.rate;
        data.amount = Number(quantity) * Number(rate);
      }
    }

    await this.itemRepo.update(id, data);
    const updated = await this.findOne(id);

    if (updated?.section_id) {
      await this.updateSectionTotals(updated.section_id);
    }

    return updated;
  }

  // ✅ Delete item and adjust totals
  async remove(id: number): Promise<void> {
    const item = await this.findOne(id);

    if (item?.section_id) {
      await this.itemRepo.delete(id);
      await this.updateSectionTotals(item.section_id);
    } else {
      await this.itemRepo.delete(id);
    }
  }

  // 🆕 Bulk create items
  async createBulk(items: Partial<Item>[]): Promise<Item[]> {
    // Auto-calculate amounts
    const processedItems = items.map((item) => {
      if (item.quantity && item.rate && !item.amount) {
        item.amount = Number(item.quantity) * Number(item.rate);
      }
      return item;
    });

    const created = await this.itemRepo.save(processedItems);

    // Update section totals for all affected sections
    const sectionIds = [
      ...new Set(created.map((item) => item.section_id).filter(Boolean)),
    ];
    for (const sectionId of sectionIds) {
      if (sectionId) await this.updateSectionTotals(sectionId);
    }

    return created;
  }

  // 🆕 Calculate section totals
  async calculateSectionTotals(
    sectionId: number,
  ): Promise<{ total_amount: number; item_count: number }> {
    const result = await this.itemRepo
      .createQueryBuilder('item')
      .select('SUM(item.amount)', 'total_amount')
      .addSelect('COUNT(item.id)', 'item_count')
      .where('item.section_id = :sectionId', { sectionId })
      .getRawOne();

    return {
      total_amount: Number(result.total_amount) || 0,
      item_count: Number(result.item_count) || 0,
    };
  }

  // 🔧 Helper - Update section totals and cascade to bill totals
  private async updateSectionTotals(section_id?: number): Promise<void> {
    if (!section_id) return;

    const totals = await this.calculateSectionTotals(section_id);

    await this.sectionRepo.update(section_id, {
      total_amount: totals.total_amount,
      item_count: totals.item_count,
    });

    // 🆕 CASCADE: Use SectionService to recalculate totals (includes bill cascade)
    await this.sectionService.recalculateTotals(section_id);
  }
}
