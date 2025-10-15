import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { BoqService } from './boq.service';
import { Boq } from '../entities/boq.entity';

@Controller('boq')
export class BoqController {
  constructor(private readonly boqService: BoqService) {}

  // ✅ Fetch all BoQ items (optionally filter by project)
  @Get()
  async getAll(@Query('project_id') project_id?: string): Promise<Boq[]> {
    return this.boqService.findAll(project_id);
  }

  // ✅ Fetch a single BoQ item by ID
  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: number): Promise<Boq | null> {
    return this.boqService.findOne(id);
  }

  // ✅ Create a new BoQ item
  @Post()
  async create(@Body() data: Partial<Boq>): Promise<Boq> {
    return this.boqService.create(data);
  }

  // ✅ Update a BoQ item
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<Boq>,
  ): Promise<Boq | null> {
    return this.boqService.update(id, data);
  }

  // ✅ Delete a BoQ item
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.boqService.remove(id);
  }
}
