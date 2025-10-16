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
import { SectionService } from '../services/section.service'; // 🔄 Updated import path
import { Section } from '../entities/section.entity'; // 🔄 Updated import

@Controller('boq/sections') // 🔄 Updated route - nested under BOQ module
export class SectionController {
  constructor(private readonly sectionService: SectionService) {} // 🔄 Updated service name

  // ✅ Fetch all sections (optionally filter by project or bill)
  @Get()
  async getAll(
    @Query('project_id') project_id?: string,
    @Query('bill_id') bill_id?: string, // 🆕 NEW: Filter by bill
  ): Promise<Section[]> {
    return this.sectionService.findAll({ project_id, bill_id });
  }

  // ✅ Fetch a single section by ID with all items
  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: number): Promise<Section | null> {
    return this.sectionService.findOne(id);
  }

  // 🆕 NEW: Get section with full details (items + collections)
  @Get(':id/full')
  async getFullSection(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Section | null> {
    return this.sectionService.findOneWithDetails(id);
  }

  // ✅ Create a new section
  @Post()
  async create(@Body() data: Partial<Section>): Promise<Section> {
    return this.sectionService.create(data);
  }

  // ✅ Update a section
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<Section>,
  ): Promise<Section | null> {
    return this.sectionService.update(id, data);
  }

  // ✅ Delete a section
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.sectionService.remove(id);
  }

  // 🆕 NEW: Get all items within a section
  @Get(':id/items')
  async getSectionItems(@Param('id', ParseIntPipe) id: number) {
    return this.sectionService.getSectionItems(id);
  }

  // 🆕 NEW: Get all collections within a section
  @Get(':id/collections')
  async getSectionCollections(@Param('id', ParseIntPipe) id: number) {
    return this.sectionService.getSectionCollections(id);
  }

  // 🆕 NEW: Calculate section totals and statistics
  @Get(':id/stats')
  async getSectionStats(@Param('id', ParseIntPipe) id: number) {
    return this.sectionService.calculateSectionStats(id);
  }

  // 🆕 NEW: Bulk update section totals (useful after item changes)
  @Post(':id/recalculate')
  async recalculateTotals(@Param('id', ParseIntPipe) id: number) {
    return this.sectionService.recalculateTotals(id);
  }

  // 🆕 NEW: Copy section to another bill
  @Post(':id/copy')
  async copySection(
    @Param('id', ParseIntPipe) id: number,
    @Body('target_bill_id') target_bill_id: number,
  ): Promise<Section> {
    return this.sectionService.copyToAnotherBill(id, target_bill_id);
  }

  // 🆕 NEW: Reorder sections within a bill
  @Patch('reorder')
  async reorderSections(
    @Body() data: { section_id: number; new_sort_order: number }[],
  ): Promise<void> {
    return this.sectionService.reorderSections(data);
  }
}
