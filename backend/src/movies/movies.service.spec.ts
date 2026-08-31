import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MoviesService } from './movies.service';
import { Movie } from './movie.entity';

describe('MoviesService', () => {
  let service: MoviesService;

  // 1. إنشاء (Mock) للـ Repository عشان مش عايزين نضرب الداتابيز الحقيقية في التیست
  const mockMovieRepository = {
    findAndCount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoviesService,
        {
          provide: getRepositoryToken(Movie),
          useValue: mockMovieRepository,
        },
      ],
    }).compile();

    service = module.get<MoviesService>(MoviesService);
  });

  afterEach(() => {
    jest.clearAllMocks(); // تنظيف الموكس بعد كل اختبار عشان مايأثروش على بعض
  });

  // الاختبار الأول: التأكد إن السيرفيس شغالة وموجودة
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // الاختبار التاني: التأكد إنها بترجع القيم الافتراضية صح لو مفيش parameters
  it('should return paginated movies with default parameters', async () => {
    // بيانات وهمية
    const mockMovies = [
      { id: 1, title: 'Barbie', releaseYear: 2023, rating: 7.5 },
      { id: 2, title: 'Oppenheimer', releaseYear: 2023, rating: 8.4 },
    ];

    mockMovieRepository.findAndCount.mockResolvedValue([mockMovies, 2]);

    const result = await service.findAll({});

    expect(result).toEqual({
      data: mockMovies,
      page: 1,
      limit: 8,
      total: 2,
      totalPages: 1,
    });

    // التأكد إن TypeORM خد القيم الافتراضية (newest, page 1, limit 8)
    expect(mockMovieRepository.findAndCount).toHaveBeenCalledWith({
      order: { releaseYear: 'DESC', id: 'ASC' },
      skip: 0,
      take: 8,
    });
  });

  // الاختبار التالت: التأكد إنها بتحسب الصفحات والترتيب صح
  it('should handle custom sorting and pagination correctly', async () => {
    mockMovieRepository.findAndCount.mockResolvedValue([[], 50]);

    // طلب الصفحة التانية، 5 أفلام في الصفحة، وترتيب من الأقدم للأحدث
    await service.findAll({ page: 2, limit: 5, sort: 'oldest' });

    expect(mockMovieRepository.findAndCount).toHaveBeenCalledWith({
      order: { releaseYear: 'ASC', id: 'ASC' },
      skip: 5, // (2 - 1) * 5 = 5
      take: 5,
    });
  });
});
