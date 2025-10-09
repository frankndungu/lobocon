import { Controller, Get, Param, Query, ParseIntPipe } from '@nestjs/common';
import { KsmmClauseService } from './ksmm-clause.service';

@Controller('clauses')
export class KsmmClauseController {
  constructor(private readonly clauseService: KsmmClauseService) {}

  /**
   * GET /clauses
   * Optionally supports search query ?search=term
   */
  @Get()
  async getAll(@Query('search') search?: string) {
    return search
      ? await this.clauseService.search(search.trim())
      : await this.clauseService.findAll();
  }

  /**
   * GET /clauses/:id
   * Fetch single clause by ID
   */
  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: number) {
    return await this.clauseService.findOne(id);
  }
}
