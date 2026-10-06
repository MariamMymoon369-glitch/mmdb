import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';

jest.mock('@nestjs/passport', () => ({
  AuthGuard: jest.fn(() => class MockAuthGuard {}),
  PassportStrategy: jest.fn(() => (target: object) => target),
  PassportModule: { register: jest.fn() },
}));

jest.mock('@nestjs/jwt', () => ({
  JwtService: jest.fn(),
}));

describe('ReviewsController', () => {
  let controller: ReviewsController;

  const mockReviewsService = {
    findAllForMovie: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewsController],
      providers: [
        {
          provide: ReviewsService,
          useValue: mockReviewsService,
        },
      ],
    }).compile();

    controller = module.get<ReviewsController>(ReviewsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('getReviews passes movie uuid and query to the service', async () => {
    const query = { page: 2, limit: 5 };
    await controller.getReviews('m1', query);

    expect(mockReviewsService.findAllForMovie).toHaveBeenCalledWith(
      'm1',
      query,
    );
  });

  it('create uses the authenticated user id', async () => {
    await controller.create('m1', { title: 't', body: 'b' }, {
      user: { userId: 42 },
    } as never);

    expect(mockReviewsService.create).toHaveBeenCalledWith('m1', 42, {
      title: 't',
      body: 'b',
    });
  });
});
