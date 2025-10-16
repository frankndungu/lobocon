import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Import all BOQ entities
import { Bill } from './entities/bill.entity';
import { Section } from './entities/section.entity';
import { Item } from './entities/item.entity';
import { Collection } from './entities/collection.entity';

// Import all controllers
import { BillController } from './controllers/bill.controller';
import { SectionController } from './controllers/section.controller';
import { ItemController } from './controllers/item.controller';
import { CollectionController } from './controllers/collection.controller';

// Import all services
import { BillService } from './services/bill.service';
import { SectionService } from './services/section.service';
import { ItemService } from './services/item.service';
import { CollectionService } from './services/collection.service';

@Module({
  imports: [
    // Register all BOQ entities with TypeORM
    TypeOrmModule.forFeature([Bill, Section, Item, Collection]),
  ],
  controllers: [
    // Register all BOQ controllers
    BillController,
    SectionController,
    ItemController,
    CollectionController,
  ],
  providers: [
    // Register all BOQ services
    BillService,
    SectionService,
    ItemService,
    CollectionService,
  ],
  exports: [
    // Export services for use in other modules
    BillService,
    SectionService,
    ItemService,
    CollectionService,
  ],
})
export class BoqModule {}
