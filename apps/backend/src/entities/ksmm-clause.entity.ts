import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'ksmm_clauses' })
export class KsmmClause {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  section_code: string; // e.g. A, B, C

  @Column()
  section: string; // e.g. A1, B2, F16

  @Column()
  contents: string; // e.g. Preliminaries, Concrete Work

  @Column()
  clause_title: string; // e.g. Bills of Quantities

  @Column({ type: 'text' })
  clause_reference: string; // Detailed description
}
