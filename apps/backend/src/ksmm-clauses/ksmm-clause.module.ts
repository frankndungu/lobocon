import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KsmmClause } from './entities/ksmm-clause.entity';
import { KsmmClauseService } from './ksmm-clause.service';
import { KsmmClauseController } from './ksmm-clause.controller';

@Module({
  imports: [TypeOrmModule.forFeature([KsmmClause])],
  providers: [KsmmClauseService],
  controllers: [KsmmClauseController],
})
export class KsmmClauseModule {}
