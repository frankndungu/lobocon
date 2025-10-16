import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Project } from '../../projects/entities/project.entity'; // 🔄 Updated path
import { Section } from './section.entity'; // 🔄 Will be renamed from BoqSummary
import { Collection } from './collection.entity'; // 🆕 NEW: Import Collection

// 🆕 Add the item types from your mockup - these are the 6 types you showed
export enum ItemType {
  MEASURED = 'MEASURED', // Measured items with quantities (most common)
  LUMP_SUM = 'LUMP_SUM', // L Sum items (fixed price items)
  PRIME_COST = 'PRIME_COST', // PC Sum items (prime cost + percentage)
  PROVISIONAL = 'PROVISIONAL', // P Sum items (provisional amounts)
  ATTENDANT = 'ATTENDANT', // ATT items (attendant on other work)
  COLLECTION = 'COLLECTION', // Collection items with page references
}

@Entity({ name: 'boq_items' }) // 🔄 Keeping same table name for now to avoid migration issues
export class Item {
  // 🔄 Renamed class from Boq to Item for clarity
  @PrimaryGeneratedColumn()
  id: number;

  // 🔄 Relationship to Project (unchanged)
  @ManyToOne(() => Project, (project) => project.boqItems, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column()
  project_id: string; // UUID FK to projects table

  // 🔄 Updated relationship - Section instead of BoqSummary
  @ManyToOne(() => Section, (section) => section.items, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'section_id' }) // 🔄 Renamed from summary_id
  section?: Section;

  @Column({ nullable: true })
  section_id?: number; // 🔄 Renamed from summary_id

  // 🆕 NEW: Item type classification - this will help with UI badges and behavior
  @Column({
    type: 'enum',
    enum: ItemType,
    default: ItemType.MEASURED,
  })
  item_type: ItemType;

  @Column()
  item_code: string; // e.g. "A.1.1", "B.2.3"

  @Column({ type: 'text' })
  description: string; // Item description

  @Column({ nullable: true })
  ksmm_reference?: string; // e.g. "KSMM 2020 - 3.1.2"

  @Column({ nullable: true })
  remarks?: string; // Additional notes

  // 🆕 NEW: Page reference for collection items (from your mockup)
  @Column({ nullable: true })
  page_reference?: string; // e.g. "Page 45", "See Appendix A"

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity: number;

  @Column()
  unit: string; // e.g. "m²", "Nr", "Item", "Sum"

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  rate: number; // Unit rate in KES

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number; // Total = quantity × rate (auto-calculated)

  // 🔄 Removed section_name field - this will come from Section entity relationship

  // 🆕 NEW: Collections relationship (items can have associated collections)
  @OneToMany(() => Collection, (collection) => collection.parent_item)
  collections: Collection[];
}
