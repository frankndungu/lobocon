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
import { CollectionService } from '../services/collection.service';
import { Collection } from '../entities/collection.entity';
import { CreateCollectionDto } from '../dto/create-collection.dto';
import { UpdateCollectionDto } from '../dto/update-collection.dto';

@Controller('boq/collections') // Collections endpoint
export class CollectionController {
  constructor(private readonly collectionService: CollectionService) {}

  // ✅ Fetch all collections (optionally filter by project, section, or type)
  @Get()
  async getAll(
    @Query('project_id') project_id?: string,
    @Query('section_id') section_id?: string,
    @Query('collection_type') collection_type?: string,
  ): Promise<Collection[]> {
    return this.collectionService.findAll({
      project_id,
      section_id,
      collection_type,
    });
  }

  // ✅ Fetch a single collection by ID
  @Get(':id')
  async getOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Collection | null> {
    return this.collectionService.findOne(id);
  }

  // ✅ Create a new collection
  @Post()
  async create(
    @Body() createCollectionDto: CreateCollectionDto,
  ): Promise<Collection> {
    return this.collectionService.create(createCollectionDto);
  }

  // ✅ Update a collection
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCollectionDto: UpdateCollectionDto,
  ): Promise<Collection | null> {
    return this.collectionService.update(id, updateCollectionDto);
  }

  // ✅ Delete a collection
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.collectionService.remove(id);
  }

  // 🆕 Get collections by type (PAGE_REFERENCE, DRAWING_REFERENCE, etc.)
  @Get('type/:type')
  async getByType(
    @Param('type') type: string,
    @Query('project_id') project_id?: string,
  ): Promise<Collection[]> {
    return this.collectionService.findByType(type, project_id);
  }

  // 🆕 Search collections by page reference
  @Get('search/page-reference')
  async searchByPageReference(
    @Query('query') query: string,
    @Query('project_id') project_id?: string,
  ): Promise<Collection[]> {
    return this.collectionService.searchByPageReference(query, project_id);
  }

  // 🆕 Get all page references for a project (for autocomplete)
  @Get('project/:projectId/page-references')
  async getProjectPageReferences(
    @Param('projectId') projectId: string,
  ): Promise<string[]> {
    return this.collectionService.getProjectPageReferences(projectId);
  }

  // 🆕 Get all document references for a project
  @Get('project/:projectId/document-references')
  async getProjectDocumentReferences(
    @Param('projectId') projectId: string,
  ): Promise<string[]> {
    return this.collectionService.getProjectDocumentReferences(projectId);
  }

  // 🆕 Bulk create collections (useful for importing)
  @Post('bulk')
  async createBulk(
    @Body() collections: Partial<Collection>[],
  ): Promise<Collection[]> {
    return this.collectionService.createBulk(collections);
  }

  // 🆕 Update collection totals (if it references items)
  @Post(':id/recalculate')
  async recalculateTotals(@Param('id', ParseIntPipe) id: number) {
    return this.collectionService.recalculateTotals(id);
  }
}
