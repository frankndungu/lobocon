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
import { BoqSummaryService } from './boq-summary.service';
import { BoqSummary } from '../entities/boq-summary.entity';

@Controller('boq-summary')
export class BoqSummaryController {
  constructor(private readonly summaryService: BoqSummaryService) {}

  // ✅ Get all summaries (optional project filter)
  @Get()
  async getAll(
    @Query('project_id') project_id?: string,
  ): Promise<BoqSummary[]> {
    return this.summaryService.findAll(project_id);
  }

  // ✅ Get one summary with its BoQ items
  @Get(':id')
  async getOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<BoqSummary | null> {
    return this.summaryService.findOne(id);
  }

  // ✅ Create new summary section
  @Post()
  async create(@Body() data: Partial<BoqSummary>): Promise<BoqSummary> {
    return this.summaryService.create(data);
  }

  // ✅ Update section name, notes, etc.
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<BoqSummary>,
  ): Promise<BoqSummary | null> {
    return this.summaryService.update(id, data);
  }

  // ✅ Delete summary (and cascade deletes its items)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.summaryService.remove(id);
  }
}
