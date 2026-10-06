import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { PeopleService } from './people.service';
import { Person } from './person.entity';

describe('PeopleService', () => {
  let service: PeopleService;

  const mockPersonRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PeopleService,
        {
          provide: getRepositoryToken(Person),
          useValue: mockPersonRepository,
        },
      ],
    }).compile();

    service = module.get<PeopleService>(PeopleService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('returns a person by uuid', async () => {
    mockPersonRepository.findOne.mockResolvedValue({ uuid: 'p1', name: 'A' });

    await expect(service.findByUuid('p1')).resolves.toEqual({
      uuid: 'p1',
      name: 'A',
    });
  });

  it('throws NotFoundException for unknown person', async () => {
    mockPersonRepository.findOne.mockResolvedValue(null);

    await expect(service.findByUuid('missing')).rejects.toThrow(
      NotFoundException,
    );
  });
});
