import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Collection } from '../entities/collection.entity';

@Injectable()
export class CollectionService {
  constructor(
    @InjectRepository(Collection)
    private readonly collectionRepo: Repository<Collection>,
  ) {}

  // ✅ Get all collections with filtering
  async findAll(filters?: {
    project_id?: string;
    section_id?: string;
    collection_type?: string;
  }): Promise<Collection[]> {
    const query = this.collectionRepo
      .createQueryBuilder('collection')
      .leftJoinAndSelect('collection.section', 'section')
      .leftJoinAndSelect('collection.project', 'project')
      .leftJoinAndSelect('collection.parent_item', 'parent_item');

    if (filters?.project_id) {
      query.andWhere('collection.project_id = :project_id', {
        project_id: filters.project_id,
      });
    }

    if (filters?.section_id) {
      query.andWhere('collection.section_id = :section_id', {
        section_id: filters.section_id,
      });
    }

    if (filters?.collection_type) {
      query.andWhere('collection.collection_type = :collection_type', {
        collection_type: filters.collection_type,
      });
    }

    return query.orderBy('collection.sort_order', 'ASC').getMany();
  }

  // ✅ Get single collection
  async findOne(id: number): Promise<Collection | null> {
    return this.collectionRepo.findOne({
      where: { id },
      relations: ['section', 'project', 'parent_item'],
    });
  }

  // ✅ Create collection
  async create(data: Partial<Collection>): Promise<Collection> {
    const collection = this.collectionRepo.create(data);
    return this.collectionRepo.save(collection);
  }

  // ✅ Update collection
  async update(
    id: number,
    data: Partial<Collection>,
  ): Promise<Collection | null> {
    await this.collectionRepo.update(id, data);
    return this.findOne(id);
  }

  // ✅ Delete collection
  async remove(id: number): Promise<void> {
    await this.collectionRepo.delete(id);
  }

  // 🆕 Find collections by type
  async findByType(type: string, project_id?: string): Promise<Collection[]> {
    const query = this.collectionRepo
      .createQueryBuilder('collection')
      .leftJoinAndSelect('collection.section', 'section')
      .where('collection.collection_type = :type', { type });

    if (project_id) {
      query.andWhere('collection.project_id = :project_id', { project_id });
    }

    return query.orderBy('collection.sort_order', 'ASC').getMany();
  }

  // 🆕 Search collections by page reference
  async searchByPageReference(
    query: string,
    project_id?: string,
  ): Promise<Collection[]> {
    const searchQuery = this.collectionRepo
      .createQueryBuilder('collection')
      .leftJoinAndSelect('collection.section', 'section')
      .where('collection.page_reference ILIKE :query', { query: `%${query}%` })
      .orWhere('collection.document_reference ILIKE :query', {
        query: `%${query}%`,
      });

    if (project_id) {
      searchQuery.andWhere('collection.project_id = :project_id', {
        project_id,
      });
    }

    return searchQuery.orderBy('collection.sort_order', 'ASC').getMany();
  }

  // 🆕 Get all unique page references for a project (for autocomplete)
  async getProjectPageReferences(projectId: string): Promise<string[]> {
    const result = await this.collectionRepo
      .createQueryBuilder('collection')
      .select('DISTINCT collection.page_reference', 'page_reference')
      .where('collection.project_id = :projectId', { projectId })
      .andWhere('collection.page_reference IS NOT NULL')
      .andWhere('collection.page_reference != :empty', { empty: '' })
      .orderBy('collection.page_reference', 'ASC')
      .getRawMany();

    return result.map((r) => r.page_reference);
  }

  // 🆕 Get all unique document references for a project
  async getProjectDocumentReferences(projectId: string): Promise<string[]> {
    const result = await this.collectionRepo
      .createQueryBuilder('collection')
      .select('DISTINCT collection.document_reference', 'document_reference')
      .where('collection.project_id = :projectId', { projectId })
      .andWhere('collection.document_reference IS NOT NULL')
      .andWhere('collection.document_reference != :empty', { empty: '' })
      .orderBy('collection.document_reference', 'ASC')
      .getRawMany();

    return result.map((r) => r.document_reference);
  }

  // 🆕 Bulk create collections
  async createBulk(collections: Partial<Collection>[]): Promise<Collection[]> {
    return this.collectionRepo.save(collections);
  }

  // 🆕 Recalculate collection totals (if it references items)
  async recalculateTotals(collectionId: number): Promise<void> {
    // This would be implemented if collections can reference and aggregate item values
    // For now, it's a placeholder for future functionality
    const collection = await this.findOne(collectionId);

    if (collection && collection.parent_item_id) {
      // If collection references a parent item, we could aggregate related values
      // Implementation depends on specific business logic
      console.log(`Recalculating totals for collection ${collectionId}`);
    }
  }

  // 🆕 Get collections by section with statistics
  async getCollectionsBySection(sectionId: number): Promise<{
    collections: Collection[];
    stats: {
      total_count: number;
      by_type: { [key: string]: number };
    };
  }> {
    const collections = await this.collectionRepo.find({
      where: { section_id: sectionId },
      relations: ['parent_item'],
      order: { sort_order: 'ASC' },
    });

    const by_type = collections.reduce(
      (acc, collection) => {
        acc[collection.collection_type] =
          (acc[collection.collection_type] || 0) + 1;
        return acc;
      },
      {} as { [key: string]: number },
    );

    return {
      collections,
      stats: {
        total_count: collections.length,
        by_type,
      },
    };
  }

  // 🆕 Copy collection to another section
  async copyToAnotherSection(
    collectionId: number,
    targetSectionId: number,
  ): Promise<Collection> {
    const originalCollection = await this.findOne(collectionId);
    if (!originalCollection) {
      throw new Error('Collection not found');
    }

    const { id, ...newCollectionData } = originalCollection;
    newCollectionData.section_id = targetSectionId;

    return this.create(newCollectionData);
  }

  // 🆕 Reorder collections within a section
  async reorderCollections(
    reorderData: { collection_id: number; new_sort_order: number }[],
  ): Promise<void> {
    for (const { collection_id, new_sort_order } of reorderData) {
      await this.collectionRepo.update(collection_id, {
        sort_order: new_sort_order,
      });
    }
  }
}
