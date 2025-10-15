import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Project } from './project.entity';
import { BoqSummary } from './boq-summary.entity';

@Entity({ name: 'boq_items' })
export class Boq {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Project, (project) => project.boqItems, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column()
  project_id: string; // ✅ UUID FK, not number

  @ManyToOne(() => BoqSummary, (summary) => summary.items, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'summary_id' })
  summary?: BoqSummary;

  @Column({ nullable: true })
  summary_id?: number;

  @Column()
  section_name: string;

  @Column()
  item_code: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ nullable: true })
  ksmm_reference?: string; // e.g. "KSMM 2020 - 3.1.2"
  @Column({ nullable: true })
  remarks?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity: number;

  @Column()
  unit: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  rate: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;
}
