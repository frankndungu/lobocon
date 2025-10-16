import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Item } from './item.entity'; // 🔄 Updated from Boq to Item
import { Bill } from './bill.entity'; // 🆕 NEW: Sections now belong to Bills
import { Collection } from './collection.entity'; // 🆕 NEW: Import Collection
import { Project } from '../../projects/entities/project.entity'; // 🔄 Updated path

@Entity({ name: 'boq_sections' }) // 🔄 Renamed table for clarity
export class Section {
  // 🔄 Renamed from BoqSummary to Section
  @PrimaryGeneratedColumn()
  id: number;

  // 🔄 Keep project relationship for easy querying
  @ManyToOne(() => Project, (project) => project.boqSections, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column()
  project_id: string;

  // 🆕 NEW: Relationship to Bill (Bill → Section → Item hierarchy)
  @ManyToOne(() => Bill, (bill) => bill.sections, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'bill_id' })
  bill: Bill;

  @Column()
  bill_id: number; // FK to bills table

  // 🔄 Enhanced section identification
  @Column()
  section_code: string; // e.g. "A", "B", "F16" (KSMM section codes)

  @Column()
  section_title: string; // 🔄 Renamed from section_name for clarity

  // 🆕 NEW: Preamble field from your mockup - important for BOQ sections
  @Column({ type: 'text', nullable: true })
  preamble?: string; // Section description/preamble text (blue boxes in mockup)

  // 🔄 Enhanced sorting and organization
  @Column({ type: 'int', default: 0 })
  sort_order: number; // For ordering sections within a bill

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  total_amount: number; // auto-calculated sum of all items in this section

  // 🆕 NEW: Item count for dashboard stats (from mockup)
  @Column({ type: 'int', default: 0 })
  item_count: number; // auto-calculated count of items

  @Column({ type: 'text', nullable: true })
  notes?: string; // Additional notes for the section

  // 🆕 NEW: Timestamps for audit trail
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;

  // 🔄 Updated relationship - Items instead of Boq
  @OneToMany(() => Item, (item) => item.section)
  items: Item[];

  // 🆕 NEW: Collections relationship
  @OneToMany(() => Collection, (collection) => collection.section)
  collections: Collection[];
}
