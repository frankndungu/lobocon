import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Section } from './section.entity';
import { Project } from '../../projects/entities/project.entity';

@Entity({ name: 'boq_bills' })
export class Bill {
  @PrimaryGeneratedColumn()
  id: number;

  // 🔗 Relationship to Project
  @ManyToOne(() => Project, (project) => project.bills, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column()
  project_id: string; // UUID FK to projects table

  // 🔢 Bill identification from your mockup
  @Column()
  bill_number: string; // e.g. "Bill No. 1", "Bill No. 2"

  @Column()
  bill_title: string; // e.g. "Preliminaries and General Items", "Building Works"

  // 📄 Bill description/scope
  @Column({ type: 'text', nullable: true })
  description?: string; // Optional detailed description of what this bill covers

  // 🎯 Organization and sorting
  @Column({ type: 'int', default: 1 })
  sort_order: number; // For ordering bills in the project (Bill 1, Bill 2, etc.)

  // 💰 Financial calculations - auto-calculated from sections
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  subtotal_amount: number; // Sum of all sections in this bill

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  contingency_percentage: number; // e.g. 6.5% from your mockup

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  contingency_amount: number; // Calculated: subtotal × contingency_percentage

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  total_amount: number; // Final total: subtotal + contingency

  // 📊 Statistics for dashboard (from your mockup)
  @Column({ type: 'int', default: 0 })
  section_count: number; // Auto-calculated count of sections

  @Column({ type: 'int', default: 0 })
  item_count: number; // Auto-calculated total items across all sections

  // 📝 Additional metadata
  @Column({ type: 'text', nullable: true })
  notes?: string; // Additional notes for this bill

  // ⏰ Audit trail
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;

  // 🔗 Relationships
  @OneToMany(() => Section, (section) => section.bill)
  sections: Section[];
}
