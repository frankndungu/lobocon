import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Section } from '../entities/section.entity';
import { Item } from '../entities/item.entity';
import { Collection } from '../entities/collection.entity';
import { Bill } from '../entities/bill.entity';

@Injectable()
export class SectionService {
  constructor(
    @InjectRepository(Section)
    private readonly sectionRepo: Repository<Section>,

    @InjectRepository(Item)
    private readonly itemRepo: Repository<Item>,

    @InjectRepository(Collection)
    private readonly collectionRepo: Repository<Collection>,

    @InjectRepository(Bill)
    private readonly billRepo: Repository<Bill>,
  ) {}

  // ✅ Get all sections with enhanced filtering
  async findAll(filters?: {
    project_id?: string;
    bill_id?: string;
  }): Promise<Section[]> {
    const query = this.sectionRepo
      .createQueryBuilder('section')
      .leftJoinAndSelect('section.bill', 'bill')
      .leftJoinAndSelect('section.project', 'project')
      .leftJoinAndSelect('section.items', 'items')
      .leftJoinAndSelect('section.collections', 'collections');

    if (filters?.project_id) {
      query.andWhere('section.project_id = :project_id', {
        project_id: filters.project_id,
      });
    }

    if (filters?.bill_id) {
      query.andWhere('section.bill_id = :bill_id', {
        bill_id: filters.bill_id,
      });
    }

    return query.orderBy('section.sort_order', 'ASC').getMany();
  }

  // ✅ Get single section
  async findOne(id: number): Promise<Section | null> {
    return this.sectionRepo.findOne({
      where: { id },
      relations: ['bill', 'project', 'items', 'collections'],
    });
  }

  // 🆕 Get section with full details
  async findOneWithDetails(id: number): Promise<Section | null> {
    return this.sectionRepo.findOne({
      where: { id },
      relations: [
        'bill',
        'project',
        'items',
        'collections',
        'items.collections',
      ],
    });
  }

  // ✅ Create section and update bill totals
  async create(data: Partial<Section>): Promise<Section> {
    const section = this.sectionRepo.create(data);
    const saved = await this.sectionRepo.save(section);

    // Update bill totals
    await this.updateBillTotals(saved.bill_id);
    return saved;
  }

  // ✅ Update section and recalculate totals
  async update(id: number, data: Partial<Section>): Promise<Section | null> {
    await this.sectionRepo.update(id, data);
    const updated = await this.findOne(id);

    if (updated?.bill_id) {
      await this.updateBillTotals(updated.bill_id);
    }

    return updated;
  }

  // ✅ Delete section and adjust totals
  async remove(id: number): Promise<void> {
    const section = await this.findOne(id);

    if (section?.bill_id) {
      await this.sectionRepo.delete(id);
      await this.updateBillTotals(section.bill_id);
    } else {
      await this.sectionRepo.delete(id);
    }
  }

  // 🆕 Get all items within a section
  async getSectionItems(sectionId: number): Promise<Item[]> {
    return this.itemRepo.find({
      where: { section_id: sectionId },
      relations: ['collections'],
      order: { item_code: 'ASC' },
    });
  }

  // 🆕 Get all collections within a section
  async getSectionCollections(sectionId: number): Promise<Collection[]> {
    return this.collectionRepo.find({
      where: { section_id: sectionId },
      order: { sort_order: 'ASC' },
    });
  }

  // 🆕 Calculate section statistics
  async calculateSectionStats(sectionId: number): Promise<{
    total_amount: number;
    item_count: number;
    collection_count: number;
    item_types: { [key: string]: number };
  }> {
    const itemStats = await this.itemRepo
      .createQueryBuilder('item')
      .select('SUM(item.amount)', 'total_amount')
      .addSelect('COUNT(item.id)', 'item_count')
      .addSelect('item.item_type', 'item_type')
      .addSelect('COUNT(item.id)', 'type_count')
      .where('item.section_id = :sectionId', { sectionId })
      .groupBy('item.item_type')
      .getRawMany();

    const collectionCount = await this.collectionRepo.count({
      where: { section_id: sectionId },
    });

    const item_types = itemStats.reduce((acc, stat) => {
      acc[stat.item_type] = Number(stat.type_count);
      return acc;
    }, {});

    const total_amount = itemStats.reduce(
      (sum, stat) => sum + Number(stat.total_amount || 0),
      0,
    );
    const item_count = itemStats.reduce(
      (sum, stat) => sum + Number(stat.type_count || 0),
      0,
    );

    return {
      total_amount,
      item_count,
      collection_count: collectionCount,
      item_types,
    };
  }

  // 🆕 Recalculate section totals
  async recalculateTotals(sectionId: number): Promise<void> {
    const stats = await this.calculateSectionStats(sectionId);

    await this.sectionRepo.update(sectionId, {
      total_amount: stats.total_amount,
      item_count: stats.item_count,
    });

    // Also update the parent bill
    const section = await this.findOne(sectionId);
    if (section?.bill_id) {
      await this.updateBillTotals(section.bill_id);
    }
  }

  // 🆕 Copy section to another bill
  async copyToAnotherBill(
    sectionId: number,
    targetBillId: number,
  ): Promise<Section> {
    const originalSection = await this.findOneWithDetails(sectionId);
    if (!originalSection) {
      throw new Error('Section not found');
    }

    // Create new section
    const { id, ...newSectionData } = originalSection;
    newSectionData.bill_id = targetBillId;

    const newSection = await this.create(newSectionData);

    // Copy items
    for (const item of originalSection.items) {
      const { id: itemId, ...newItemData } = item;
      newItemData.section_id = newSection.id;
      await this.itemRepo.save(newItemData);
    }

    // Copy collections
    for (const collection of originalSection.collections) {
      const { id: collectionId, ...newCollectionData } = collection;
      newCollectionData.section_id = newSection.id;
      await this.collectionRepo.save(newCollectionData);
    }

    await this.recalculateTotals(newSection.id);
    return newSection;
  }

  // 🆕 Reorder sections within a bill
  async reorderSections(
    reorderData: { section_id: number; new_sort_order: number }[],
  ): Promise<void> {
    for (const { section_id, new_sort_order } of reorderData) {
      await this.sectionRepo.update(section_id, { sort_order: new_sort_order });
    }
  }

  // 🔧 Helper - Update bill totals
  private async updateBillTotals(bill_id?: number): Promise<void> {
    if (!bill_id) return;

    const result = await this.sectionRepo
      .createQueryBuilder('section')
      .select('SUM(section.total_amount)', 'subtotal_amount')
      .addSelect('COUNT(section.id)', 'section_count')
      .where('section.bill_id = :bill_id', { bill_id })
      .getRawOne();

    const subtotal_amount = Number(result.subtotal_amount) || 0;
    const section_count = Number(result.section_count) || 0;

    // Get bill to calculate contingency
    const bill = await this.billRepo.findOne({ where: { id: bill_id } });
    if (bill) {
      const contingency_amount =
        subtotal_amount * (bill.contingency_percentage / 100);
      const total_amount = subtotal_amount + contingency_amount;

      await this.billRepo.update(bill_id, {
        subtotal_amount,
        contingency_amount,
        total_amount,
        section_count,
      });
    }
  }
}
