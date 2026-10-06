import { Test, TestingModule } from '@nestjs/testing';
import { PeopleController } from './people.controller';
import { PeopleService } from './people.service';

describe('PeopleController', () => {
  let controller: PeopleController;

  const mockPeopleService = {
    findByUuid: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PeopleController],
      providers: [
        {
          provide: PeopleService,
          useValue: mockPeopleService,
        },
      ],
    }).compile();

    controller = module.get<PeopleController>(PeopleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('getPerson delegates to the service', async () => {
    await controller.getPerson('p1');

    expect(mockPeopleService.findByUuid).toHaveBeenCalledWith('p1');
  });
});
