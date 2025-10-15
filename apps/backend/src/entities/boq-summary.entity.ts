import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Boq } from './boq.entity';
import { Project } from './project.entity';

@Entity({ name: 'boq_summary' })
export class BoqSummary {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Project, (project) => project.boqSummaries, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column()
  project_id: string;

  @Column()
  bill_no: string; // e.g. "Bill No. 3"

  @Column()
  section_name: string; // e.g. "Substructure"

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  total_amount: number; // auto-calculated sum of all items

  @Column({ type: 'text', nullable: true })
  notes?: string; // optional notes for the section (e.g. "Includes excavation and hardcore")

  @OneToMany(() => Boq, (boq) => boq.summary)
  items: Boq[];
}
