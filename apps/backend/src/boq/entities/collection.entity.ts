import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Item } from './item.entity';
import { Section } from './section.entity';
import { Project } from '../../projects/entities/project.entity';

@Entity({ name: 'boq_collections' })
export class Collection {
  @PrimaryGeneratedColumn()
  id: number;

  // 🔗 Relationship to Project (for easy querying)
  @ManyToOne(() => Project, (project) => project.collections, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column()
  project_id: string; // UUID FK to projects table

  // 🔗 Relationship to Section (collections belong to sections)
  @ManyToOne(() => Section, (section) => section.collections, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'section_id' })
  section: Section;

  @Column()
  section_id: number; // FK to sections table

  // 🔗 Optional relationship to parent Item (for collection items that reference other items)
  @ManyToOne(() => Item, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'parent_item_id' })
  parent_item?: Item;

  @Column({ nullable: true })
  parent_item_id?: number; // Optional FK to items table

  // 📖 Collection identification
  @Column()
  collection_title: string; // e.g. "Collection of Items", "Page References"

  @Column({ type: 'text' })
  description: string; // Description of what this collection contains

  // 📄 Page reference information (key feature from mockup)
  @Column()
  page_reference: string; // e.g. "Page 45", "See Appendix A", "Refer to Drawing D-001"

  @Column({ nullable: true })
  document_reference?: string; // e.g. "Drawing D-001", "Specification S-002"

  // 💰 Collection totals (if applicable)
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  total_amount: number; // Total value of items in this collection

  @Column({ type: 'int', default: 0 })
  item_count: number; // Number of items in this collection

  // 🎯 Organization
  @Column({ type: 'int', default: 0 })
  sort_order: number; // For ordering collections within a section

  // 📝 Additional metadata
  @Column({ type: 'text', nullable: true })
  notes?: string; // Additional notes about this collection

  // 🏷️ Collection type classification
  @Column({
    type: 'enum',
    enum: [
      'PAGE_REFERENCE',
      'ITEM_COLLECTION',
      'DRAWING_REFERENCE',
      'SPECIFICATION_REFERENCE',
    ],
    default: 'PAGE_REFERENCE',
  })
  collection_type: string; // Type of collection for UI handling

  // ⏰ Audit trail
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;
}
