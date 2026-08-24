import { MoviesController } from './movies.controller';
import { MoviesService } from './movies.service';

describe('MoviesController', () => {
  let controller: MoviesController;
  let service: { findAll: jest.Mock };

  beforeEach(() => {
    service = { findAll: jest.fn().mockResolvedValue({ data: [] }) };
    controller = new MoviesController(service as unknown as MoviesService);
  });

  it('uses the default page, limit, and newest sort', async () => {
    await controller.getMovies();

    expect(service.findAll).toHaveBeenCalledWith({
      page: 1,
      limit: 8,
      sort: 'newest',
    });
  });

  it('converts query parameters and accepts the oldest sort', async () => {
    await controller.getMovies('2', '12', 'oldest');

    expect(service.findAll).toHaveBeenCalledWith({
      page: 2,
      limit: 12,
      sort: 'oldest',
    });
  });

  it('falls back to newest for unsupported sort values', async () => {
    await controller.getMovies('bad', 'bad', 'popular');

    expect(service.findAll).toHaveBeenCalledWith({
      page: 1,
      limit: 8,
      sort: 'newest',
    });
  });
});
