import { Test, TestingModule } from '@nestjs/testing';
import { BoqService } from './boq.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Boq } from '../entities/boq.entity';
import { BoqSummary } from '../entities/boq-summary.entity';

describe('BoqService', () => {
  let service: BoqService;
  let boqRepo: Repository<Boq>;
  let summaryRepo: Repository<BoqSummary>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoqService,
        {
          provide: getRepositoryToken(Boq),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              getMany: jest.fn(),
            })),
          },
        },
        {
          provide: getRepositoryToken(BoqSummary),
          useValue: {
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BoqService>(BoqService);
    boqRepo = module.get<Repository<Boq>>(getRepositoryToken(Boq));
    summaryRepo = module.get<Repository<BoqSummary>>(
      getRepositoryToken(BoqSummary),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all BoQ items', async () => {
      const items = [{ id: 1 } as Boq];
      (boqRepo.createQueryBuilder as any).mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(items),
      });

      const result = await service.findAll();
      expect(result).toEqual(items);
    });
  });

  describe('create', () => {
    it('should create and save a BoQ item', async () => {
      const data = { section_name: 'Substructure', rate: 500, quantity: 2 };
      const saved = { id: 1, ...data } as Boq;

      boqRepo.create = jest.fn().mockReturnValue(saved);
      boqRepo.save = jest.fn().mockResolvedValue(saved);
      jest
        .spyOn<any, any>(service, 'updateSummaryTotal')
        .mockResolvedValue(undefined);

      const result = await service.create(data);

      expect(boqRepo.create).toHaveBeenCalledWith(data);
      expect(boqRepo.save).toHaveBeenCalledWith(saved);
      expect(service['updateSummaryTotal']).toHaveBeenCalled();
      expect(result).toEqual(saved);
    });
  });

  describe('update', () => {
    it('should update and return the BoQ item', async () => {
      const updated = { id: 1, section_name: 'Updated' } as Boq;

      boqRepo.update = jest.fn().mockResolvedValue(undefined);
      service.findOne = jest.fn().mockResolvedValue(updated);
      jest
        .spyOn<any, any>(service, 'updateSummaryTotal')
        .mockResolvedValue(undefined);

      const result = await service.update(1, updated);

      expect(boqRepo.update).toHaveBeenCalledWith(1, updated);
      expect(result).toEqual(updated);
    });
  });

  describe('remove', () => {
    it('should delete the BoQ item', async () => {
      const mockItem = { id: 1, summary_id: 2 } as Boq;
      service.findOne = jest.fn().mockResolvedValue(mockItem);
      boqRepo.delete = jest.fn().mockResolvedValue(undefined);
      jest
        .spyOn<any, any>(service, 'updateSummaryTotal')
        .mockResolvedValue(undefined);

      await service.remove(1);

      expect(boqRepo.delete).toHaveBeenCalledWith(1);
      expect(service['updateSummaryTotal']).toHaveBeenCalledWith(2);
    });
  });

  describe('updateSummaryTotal', () => {
    it('should calculate and update the total amount', async () => {
      const items = [{ amount: 1000 } as Boq, { amount: 2000 } as Boq];
      boqRepo.find = jest.fn().mockResolvedValue(items);
      summaryRepo.update = jest.fn().mockResolvedValue(undefined);

      await (service as any).updateSummaryTotal(1);

      expect(summaryRepo.update).toHaveBeenCalledWith(1, {
        total_amount: 3000,
      });
    });
  });
});
