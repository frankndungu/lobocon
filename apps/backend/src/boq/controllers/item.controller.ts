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
import { ItemService } from '../services/item.service'; // 🔄 Updated import path
import { Item, ItemType } from '../entities/item.entity'; // 🔄 Updated import
import { CreateItemDto } from '../dto/create-item.dto';

@Controller('boq/items') // 🔄 Updated route - nested under BOQ module
export class ItemController {
  constructor(private readonly itemService: ItemService) {} // 🔄 Updated service name

  // ✅ Fetch all BOQ items (optionally filter by project, bill, or section)
  @Get()
  async getAll(
    @Query('project_id') project_id?: string,
    @Query('bill_id') bill_id?: string, // 🆕 NEW: Filter by bill
    @Query('section_id') section_id?: string, // 🆕 NEW: Filter by section
  ): Promise<Item[]> {
    return this.itemService.findAll({ project_id, bill_id, section_id });
  }

  // ✅ Fetch a single BOQ item by ID
  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: number): Promise<Item | null> {
    return this.itemService.findOne(id);
  }

  // ✅ Create a new BOQ item
  @Post()
  async create(@Body() createItemDto: CreateItemDto): Promise<Item> {
    return this.itemService.create(createItemDto);
  }

  // ✅ Update a BOQ item
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<Item>,
  ): Promise<Item | null> {
    return this.itemService.update(id, data);
  }

  // ✅ Delete a BOQ item
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.itemService.remove(id);
  }

  // 🆕 NEW: Get items by type (for filtering in UI)
  @Get('by-type/:type')
  async getByType(
    @Param('type') type: string,
    @Query('project_id') project_id?: string,
  ): Promise<Item[]> {
    // Convert string to ItemType enum
    const itemType = type.toUpperCase() as ItemType;
    return this.itemService.findByType(itemType, project_id);
  }

  // 🆕 NEW: Bulk create items (useful for importing)
  @Post('bulk')
  async createBulk(@Body() items: Partial<Item>[]): Promise<Item[]> {
    return this.itemService.createBulk(items);
  }

  // 🆕 NEW: Calculate totals for a section
  @Get('section/:sectionId/totals')
  async getSectionTotals(
    @Param('sectionId', ParseIntPipe) sectionId: number,
  ): Promise<{ total_amount: number; item_count: number }> {
    return this.itemService.calculateSectionTotals(sectionId);
  }
}
