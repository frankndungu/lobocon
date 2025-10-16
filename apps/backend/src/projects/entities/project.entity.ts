import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Bill } from '../../boq/entities/bill.entity'; // 🔄 Updated import
import { Section } from '../../boq/entities/section.entity'; // 🔄 Updated import
import { Item } from '../../boq/entities/item.entity'; // 🔄 Updated import
import { Collection } from '../../boq/entities/collection.entity'; // 🆕 New import

export enum ProjectType {
  RESIDENTIAL = 'RESIDENTIAL',
  COMMERCIAL = 'COMMERCIAL',
  INFRASTRUCTURE = 'INFRASTRUCTURE',
  INDUSTRIAL = 'INDUSTRIAL',
  RENOVATION = 'RENOVATION',
  OTHER = 'OTHER',
}

export enum ProjectStage {
  PRE_CONSTRUCTION = 'PRE_CONSTRUCTION',
  COURSE_OF_CONSTRUCTION = 'COURSE_OF_CONSTRUCTION',
  COMPLETION = 'COMPLETION',
  CLOSED = 'CLOSED',
}

export enum ProjectStatus {
  ACTIVE = 'ACTIVE',
  TENDERING = 'TENDERING',
  ON_HOLD = 'ON_HOLD',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  DELAYED = 'DELAYED',
  HANDOVER = 'HANDOVER',
}

@Entity({ name: 'projects' })
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Basic Info
  @Column()
  name: string;

  @Column()
  code: string;

  // Location
  @Column({ nullable: true })
  address?: string;

  @Column({ nullable: true })
  city?: string;

  @Column({ nullable: true })
  county?: string;

  @Column({ nullable: true })
  postcode?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude?: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude?: number;

  // Classification
  @Column({
    type: 'enum',
    enum: ProjectType,
    default: ProjectType.RESIDENTIAL,
  })
  type: ProjectType;

  @Column({
    type: 'enum',
    enum: ProjectStage,
    default: ProjectStage.PRE_CONSTRUCTION,
  })
  stage: ProjectStage;

  @Column({
    type: 'enum',
    enum: ProjectStatus,
    default: ProjectStatus.ACTIVE,
  })
  status: ProjectStatus;

  @Column({ nullable: true })
  department?: string;

  // Scheduling
  @Column({ nullable: true })
  programme?: string;

  @Column({ type: 'timestamp', nullable: true })
  startDate?: Date;

  @Column({ type: 'timestamp', nullable: true })
  endDate?: Date;

  // Progress
  @Column({ type: 'int', default: 0 })
  progress: number;

  // Financials
  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  budget?: number;

  @Column({ default: 'KES' })
  currency: string;

  // Metadata
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column()
  companyId: string;

  @Column()
  createdById: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  // 🔄 UPDATED BOQ Relations - New hierarchy structure

  // 🆕 Top-level BOQ relationship - Projects have Bills
  @OneToMany(() => Bill, (bill) => bill.project)
  bills: Bill[];

  // 🔄 Keep direct relationships for easy querying without joins
  @OneToMany(() => Section, (section) => section.project)
  boqSections: Section[]; // 🔄 Renamed from boqSummaries

  @OneToMany(() => Item, (item) => item.project)
  boqItems: Item[]; // 🔄 Updated to reference Item instead of Boq

  // 🆕 Collections relationship
  @OneToMany(() => Collection, (collection) => collection.project)
  collections: Collection[];
}
