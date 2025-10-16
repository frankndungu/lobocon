import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
  ) {}

  async findAll(): Promise<Project[]> {
    return this.projectRepo.find({
      relations: ['bills', 'boqSections', 'boqItems', 'collections'], // Updated relations
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Project | null> {
    return this.projectRepo.findOne({
      where: { id },
      relations: ['bills', 'boqSections', 'boqItems', 'collections'], // Updated relations
    });
  }

  // Get project with full BOQ hierarchy
  async findOneWithFullBOQ(id: string): Promise<Project | null> {
    return this.projectRepo.findOne({
      where: { id },
      relations: [
        'bills',
        'bills.sections',
        'bills.sections.items',
        'bills.sections.collections',
      ],
    });
  }

  async create(data: Partial<Project>): Promise<Project> {
    // Auto-generate project code if not provided
    if (!data.code) {
      data.code = await this.generateProjectCode();
    }

    // Set default values for Mjenzi company
    const projectData = {
      companyId: 'mjenzi',
      createdById: 'boni',
      currency: 'KES',
      ...data, // User data overrides defaults
    };

    const project = this.projectRepo.create(projectData);
    return this.projectRepo.save(project);
  }

  async update(id: string, data: Partial<Project>): Promise<Project | null> {
    await this.projectRepo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.projectRepo.delete(id);
  }

  // Get project statistics
  async getProjectStats(id: string): Promise<{
    billCount: number;
    sectionCount: number;
    itemCount: number;
    collectionCount: number;
    totalBudget: number;
  }> {
    const project = await this.projectRepo
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.bills', 'bills')
      .leftJoinAndSelect('project.boqSections', 'sections')
      .leftJoinAndSelect('project.boqItems', 'items')
      .leftJoinAndSelect('project.collections', 'collections')
      .where('project.id = :id', { id })
      .getOne();

    if (!project) {
      throw new Error('Project not found');
    }

    const totalBudget =
      project.bills?.reduce(
        (sum, bill) => sum + Number(bill.total_amount || 0),
        0,
      ) || 0;

    return {
      billCount: project.bills?.length || 0,
      sectionCount: project.boqSections?.length || 0,
      itemCount: project.boqItems?.length || 0,
      collectionCount: project.collections?.length || 0,
      totalBudget,
    };
  }

  // Auto-generate project code
  private async generateProjectCode(): Promise<string> {
    const currentYear = new Date().getFullYear();
    const prefix = `PRJ-${currentYear}`;

    // Find the highest existing number for this year
    const lastProject = await this.projectRepo
      .createQueryBuilder('project')
      .where('project.code LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('project.code', 'DESC')
      .getOne();

    let nextNumber = 1;
    if (lastProject && lastProject.code) {
      const lastNumber = parseInt(lastProject.code.split('-')[2] || '0');
      nextNumber = lastNumber + 1;
    }

    return `${prefix}-${nextNumber.toString().padStart(3, '0')}`;
  }
}
