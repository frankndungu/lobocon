import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoqSummary } from '../entities/boq-summary.entity';
import { Boq } from '../entities/boq.entity';
import { BoqSummaryService } from './boq-summary.service';
import { BoqSummaryController } from './boq-summary.controller';

@Module({
  imports: [TypeOrmModule.forFeature([BoqSummary, Boq])],
  providers: [BoqSummaryService],
  controllers: [BoqSummaryController],
})
export class BoqSummaryModule {}
