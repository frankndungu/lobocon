import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bill } from '../entities/bill.entity';
import { Section } from '../entities/section.entity';
import { Item } from '../entities/item.entity';
import { Collection } from '../entities/collection.entity';

@Injectable()
export class BillService {
  constructor(
    @InjectRepository(Bill)
    private readonly billRepo: Repository<Bill>,

    @InjectRepository(Section)
    private readonly sectionRepo: Repository<Section>,

    @InjectRepository(Item)
    private readonly itemRepo: Repository<Item>,

    @InjectRepository(Collection)
    private readonly collectionRepo: Repository<Collection>,
  ) {}

  // ✅ Get all bills for a project
  async findAll(project_id?: string): Promise<Bill[]> {
    const query = this.billRepo
      .createQueryBuilder('bill')
      .leftJoinAndSelect('bill.project', 'project')
      .leftJoinAndSelect('bill.sections', 'sections');

    if (project_id) {
      query.where('bill.project_id = :project_id', { project_id });
    }

    return query.orderBy('bill.sort_order', 'ASC').getMany();
  }

  // ✅ Get single bill
  async findOne(id: number): Promise<Bill | null> {
    return this.billRepo.findOne({
      where: { id },
      relations: ['project', 'sections'],
    });
  }

  // 🆕 Get bill with full hierarchy
  async findOneWithFullHierarchy(id: number): Promise<Bill | null> {
    return this.billRepo.findOne({
      where: { id },
      relations: [
        'project',
        'sections',
        'sections.items',
        'sections.collections',
        'sections.items.collections',
      ],
    });
  }

  // ✅ Create bill
  async create(data: Partial<Bill>): Promise<Bill> {
    const bill = this.billRepo.create(data);
    return this.billRepo.save(bill);
  }

  // ✅ Update bill
  async update(id: number, data: Partial<Bill>): Promise<Bill | null> {
    await this.billRepo.update(id, data);
    return this.findOne(id);
  }

  // ✅ Delete bill
  async remove(id: number): Promise<void> {
    await this.billRepo.delete(id);
  }

  // 🆕 Get all sections within a bill
  async getBillSections(billId: number): Promise<Section[]> {
    return this.sectionRepo.find({
      where: { bill_id: billId },
      relations: ['items', 'collections'],
      order: { sort_order: 'ASC' },
    });
  }

  // 🆕 Calculate bill statistics
  async calculateBillStats(billId: number): Promise<{
    subtotal_amount: number;
    contingency_amount: number;
    total_amount: number;
    section_count: number;
    item_count: number;
    collection_count: number;
  }> {
    // Get section totals
    const sectionStats = await this.sectionRepo
      .createQueryBuilder('section')
      .select('SUM(section.total_amount)', 'subtotal_amount')
      .addSelect('COUNT(section.id)', 'section_count')
      .addSelect('SUM(section.item_count)', 'item_count')
      .where('section.bill_id = :billId', { billId })
      .getRawOne();

    const collectionCount = await this.collectionRepo
      .createQueryBuilder('collection')
      .innerJoin('collection.section', 'section')
      .where('section.bill_id = :billId', { billId })
      .getCount();

    const bill = await this.findOne(billId);
    const subtotal_amount = Number(sectionStats.subtotal_amount) || 0;
    const contingency_percentage = bill?.contingency_percentage || 0;
    const contingency_amount = subtotal_amount * (contingency_percentage / 100);
    const total_amount = subtotal_amount + contingency_amount;

    return {
      subtotal_amount,
      contingency_amount,
      total_amount,
      section_count: Number(sectionStats.section_count) || 0,
      item_count: Number(sectionStats.item_count) || 0,
      collection_count: collectionCount,
    };
  }

  // 🆕 Recalculate bill totals
  async recalculateTotals(billId: number): Promise<void> {
    const stats = await this.calculateBillStats(billId);

    await this.billRepo.update(billId, {
      subtotal_amount: stats.subtotal_amount,
      contingency_amount: stats.contingency_amount,
      total_amount: stats.total_amount,
      section_count: stats.section_count,
      item_count: stats.item_count,
    });
  }

  // 🆕 Update contingency percentage and recalculate
  async updateContingency(
    billId: number,
    percentage: number,
  ): Promise<Bill | null> {
    await this.billRepo.update(billId, { contingency_percentage: percentage });
    await this.recalculateTotals(billId);
    return this.findOne(billId);
  }

  // 🆕 Copy bill to another project
  async copyToAnotherProject(
    billId: number,
    targetProjectId: string,
  ): Promise<Bill> {
    const originalBill = await this.findOneWithFullHierarchy(billId);
    if (!originalBill) {
      throw new Error('Bill not found');
    }

    // Create new bill
    const { id, ...newBillData } = originalBill;
    newBillData.project_id = targetProjectId;

    const newBill = await this.create(newBillData);

    // Copy sections and their items/collections
    for (const section of originalBill.sections) {
      const { id: sectionId, ...newSectionData } = section;
      newSectionData.bill_id = newBill.id;
      newSectionData.project_id = targetProjectId;

      const newSection = await this.sectionRepo.save(newSectionData);

      // Copy items
      for (const item of section.items) {
        const { id: itemId, ...newItemData } = item;
        newItemData.section_id = newSection.id;
        newItemData.project_id = targetProjectId;
        await this.itemRepo.save(newItemData);
      }

      // Copy collections
      for (const collection of section.collections) {
        const { id: collectionId, ...newCollectionData } = collection;
        newCollectionData.section_id = newSection.id;
        newCollectionData.project_id = targetProjectId;
        await this.collectionRepo.save(newCollectionData);
      }
    }

    await this.recalculateTotals(newBill.id);
    return newBill;
  }

  // 🆕 Reorder bills within a project
  async reorderBills(
    reorderData: { bill_id: number; new_sort_order: number }[],
  ): Promise<void> {
    for (const { bill_id, new_sort_order } of reorderData) {
      await this.billRepo.update(bill_id, { sort_order: new_sort_order });
    }
  }

  // 🆕 Generate bill summary report
  async generateBillSummary(billId: number): Promise<{
    bill: Bill;
    stats: any;
    sections: Array<{
      section: Section;
      item_count: number;
      collection_count: number;
    }>;
  }> {
    const bill = await this.findOneWithFullHierarchy(billId);
    if (!bill) {
      throw new Error('Bill not found');
    }

    const stats = await this.calculateBillStats(billId);

    const sections = await Promise.all(
      bill.sections.map(async (section) => {
        const item_count = await this.itemRepo.count({
          where: { section_id: section.id },
        });
        const collection_count = await this.collectionRepo.count({
          where: { section_id: section.id },
        });

        return {
          section,
          item_count,
          collection_count,
        };
      }),
    );

    return {
      bill,
      stats,
      sections,
    };
  }
}
