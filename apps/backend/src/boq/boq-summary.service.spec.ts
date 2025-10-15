import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, UpdateResult, DeleteResult } from 'typeorm';
import { BoqSummaryService } from './boq-summary.service';
import { BoqSummary } from '../entities/boq-summary.entity';
import { Boq } from '../entities/boq.entity';

describe('BoqSummaryService', () => {
  let service: BoqSummaryService;
  let summaryRepo: Repository<BoqSummary>;
  let boqRepo: Repository<Boq>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoqSummaryService,
        {
          provide: getRepositoryToken(BoqSummary),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn().mockResolvedValue({} as UpdateResult),
            delete: jest.fn().mockResolvedValue({} as DeleteResult),

            // ✅ mock createQueryBuilder
            createQueryBuilder: jest.fn(() => ({
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              getMany: jest
                .fn()
                .mockResolvedValue([
                  { id: 1, section_name: 'Substructure', total_amount: 10000 },
                ]),
            })),
          },
        },
        {
          provide: getRepositoryToken(Boq),
          useValue: {
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BoqSummaryService>(BoqSummaryService);
    summaryRepo = module.get(getRepositoryToken(BoqSummary));
    boqRepo = module.get(getRepositoryToken(Boq));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return all summaries', async () => {
    const result = await service.findAll();
    expect(result).toEqual([
      { id: 1, section_name: 'Substructure', total_amount: 10000 },
    ]);
    expect(summaryRepo.createQueryBuilder).toHaveBeenCalled();
  });

  it('should return one summary by ID', async () => {
    const mockSummary = { id: 1, section_name: 'Superstructure Works' };
    jest.spyOn(summaryRepo, 'findOne').mockResolvedValue(mockSummary as any);

    const result = await service.findOne(1);
    expect(result).toEqual(mockSummary);
    expect(summaryRepo.findOne).toHaveBeenCalledWith({
      where: { id: 1 },
      relations: ['items', 'project'], // ✅ updated to match service
    });
  });

  it('should create a new summary', async () => {
    const data = {
      project_id: 'uuid-1234',
      bill_no: 'Bill No. 2',
      section_name: 'Roofing',
    };
    const saved = { id: 3, ...data };

    jest.spyOn(summaryRepo, 'create').mockReturnValue(saved as any);
    jest.spyOn(summaryRepo, 'save').mockResolvedValue(saved as any);

    const result = await service.create(data);
    expect(result).toEqual(saved);
    expect(summaryRepo.create).toHaveBeenCalledWith(data);
    expect(summaryRepo.save).toHaveBeenCalledWith(saved);
  });

  it('should update a summary', async () => {
    const updated = { id: 1, section_name: 'Updated Section' };
    jest.spyOn(summaryRepo, 'update').mockResolvedValue({} as UpdateResult);
    jest.spyOn(summaryRepo, 'findOne').mockResolvedValue(updated as any);

    const result = await service.update(1, updated);
    expect(result).toEqual(updated);
    expect(summaryRepo.update).toHaveBeenCalledWith(1, updated);
  });

  it('should delete a summary', async () => {
    jest.spyOn(summaryRepo, 'delete').mockResolvedValue({} as DeleteResult);

    await service.remove(1);
    expect(summaryRepo.delete).toHaveBeenCalledWith(1);
  });
});
