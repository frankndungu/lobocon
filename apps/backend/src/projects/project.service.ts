import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../entities/project.entity';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
  ) {}

  async findAll(): Promise<Project[]> {
    return this.projectRepo.find({
      relations: ['boqItems', 'boqSummaries'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Project | null> {
    return this.projectRepo.findOne({
      where: { id },
      relations: ['boqItems', 'boqSummaries'],
    });
  }

  async create(data: Partial<Project>): Promise<Project> {
    const project = this.projectRepo.create(data);
    return this.projectRepo.save(project);
  }

  async update(id: string, data: Partial<Project>): Promise<Project | null> {
    await this.projectRepo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.projectRepo.delete(id);
  }
}
