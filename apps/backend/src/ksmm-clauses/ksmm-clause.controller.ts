import { Controller, Get, Param, Query } from '@nestjs/common';
import { KsmmClauseService } from './ksmm-clause.service';

@Controller('clauses')
export class KsmmClauseController {
  constructor(private readonly clauseService: KsmmClauseService) {}

  @Get()
  async getAll(@Query('search') search?: string) {
    if (search) {
      return this.clauseService.search(search);
    }
    return this.clauseService.findAll();
  }

  @Get(':id')
  async getOne(@Param('id') id: number) {
    return this.clauseService.findOne(id);
  }
}
