import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { Project } from '../entities/project.entity';

@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  async getAll(): Promise<Project[]> {
    return this.projectService.findAll();
  }

  @Get(':id')
  async getOne(@Param('id') id: string): Promise<Project | null> {
    return this.projectService.findOne(id);
  }

  @Post()
  async create(@Body() data: Partial<Project>): Promise<Project> {
    return this.projectService.create(data);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() data: Partial<Project>,
  ): Promise<Project | null> {
    return this.projectService.update(id, data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.projectService.remove(id);
  }
}
