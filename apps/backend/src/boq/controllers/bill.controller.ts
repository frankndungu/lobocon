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
import { BillService } from '../services/bill.service';
import { Bill } from '../entities/bill.entity';

@Controller('boq/bills') // Top-level BOQ bills endpoint
export class BillController {
  constructor(private readonly billService: BillService) {}

  // ✅ Fetch all bills (optionally filter by project)
  @Get()
  async getAll(@Query('project_id') project_id?: string): Promise<Bill[]> {
    return this.billService.findAll(project_id);
  }

  // ✅ Fetch a single bill by ID
  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: number): Promise<Bill | null> {
    return this.billService.findOne(id);
  }

  // 🆕 Get bill with full hierarchy (sections + items + collections)
  @Get(':id/full')
  async getFullBill(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Bill | null> {
    return this.billService.findOneWithFullHierarchy(id);
  }

  // ✅ Create a new bill
  @Post()
  async create(@Body() data: Partial<Bill>): Promise<Bill> {
    return this.billService.create(data);
  }

  // ✅ Update a bill
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<Bill>,
  ): Promise<Bill | null> {
    return this.billService.update(id, data);
  }

  // ✅ Delete a bill
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.billService.remove(id);
  }

  // 🆕 Get all sections within a bill
  @Get(':id/sections')
  async getBillSections(@Param('id', ParseIntPipe) id: number) {
    return this.billService.getBillSections(id);
  }

  // 🆕 Calculate bill totals and statistics
  @Get(':id/stats')
  async getBillStats(@Param('id', ParseIntPipe) id: number) {
    return this.billService.calculateBillStats(id);
  }

  // 🆕 Recalculate bill totals (cascade from sections)
  @Post(':id/recalculate')
  async recalculateTotals(@Param('id', ParseIntPipe) id: number) {
    return this.billService.recalculateTotals(id);
  }

  // 🆕 Update contingency percentage and recalculate
  @Patch(':id/contingency')
  async updateContingency(
    @Param('id', ParseIntPipe) id: number,
    @Body('percentage') percentage: number,
  ) {
    return this.billService.updateContingency(id, percentage);
  }

  // 🆕 Copy bill to another project
  @Post(':id/copy')
  async copyBill(
    @Param('id', ParseIntPipe) id: number,
    @Body('target_project_id') target_project_id: string,
  ): Promise<Bill> {
    return this.billService.copyToAnotherProject(id, target_project_id);
  }

  // 🆕 Reorder bills within a project
  @Patch('reorder')
  async reorderBills(
    @Body() data: { bill_id: number; new_sort_order: number }[],
  ): Promise<void> {
    return this.billService.reorderBills(data);
  }

  // 🆕 Generate bill summary report
  @Get(':id/summary')
  async getBillSummary(@Param('id', ParseIntPipe) id: number) {
    return this.billService.generateBillSummary(id);
  }
}
