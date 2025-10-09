import { Test, TestingModule } from '@nestjs/testing';
import { KsmmClauseController } from './ksmm-clause.controller';
import { KsmmClauseService } from './ksmm-clause.service';

describe('KsmmClauseController', () => {
  let controller: KsmmClauseController;
  let service: KsmmClauseService;

  const mockClauseService = {
    findAll: jest.fn(() => [
      { id: 1, title: 'Test Clause 1' },
      { id: 2, title: 'Test Clause 2' },
    ]),
    search: jest.fn((term: string) => [
      { id: 2, title: `Found clause for ${term}` },
    ]),
    findOne: jest.fn((id: number) => ({ id, title: `Clause ${id}` })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KsmmClauseController],
      providers: [
        {
          provide: KsmmClauseService,
          useValue: mockClauseService,
        },
      ],
    }).compile();

    controller = module.get<KsmmClauseController>(KsmmClauseController);
    service = module.get<KsmmClauseService>(KsmmClauseService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return all clauses when no search is provided', async () => {
    const result = await controller.getAll();
    expect(result).toHaveLength(2);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('should search clauses when search term is provided', async () => {
    const result = await controller.getAll('foundation');
    expect(result).toEqual([{ id: 2, title: 'Found clause for foundation' }]);
    expect(service.search).toHaveBeenCalledWith('foundation');
  });

  it('should return one clause by ID', async () => {
    const result = await controller.getOne(1);
    expect(result).toEqual({ id: 1, title: 'Clause 1' });
    expect(service.findOne).toHaveBeenCalledWith(1);
  });
});
