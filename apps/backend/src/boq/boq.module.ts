import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Boq } from '../entities/boq.entity';
import { BoqSummary } from '../entities/boq-summary.entity';
import { BoqService } from './boq.service';
import { BoqController } from './boq.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Boq, BoqSummary])],
  providers: [BoqService],
  controllers: [BoqController],
})
export class BoqModule {}
