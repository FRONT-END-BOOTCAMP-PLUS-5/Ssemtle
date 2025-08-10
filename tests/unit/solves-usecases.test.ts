// ABOUTME: Unit tests for Solves Use Cases following TDD approach
// ABOUTME: Tests business logic isolated from external dependencies

import {
  ListSolvesUseCase,
  GetUnitsSummaryUseCase,
  GetCategoryStatsUseCase,
} from '../../backend/solves/usecases/SolvesUseCases';
import { ISolveRepository } from '../../backend/common/domains/repositories/SolveRepository';
import {
  ListSolvesRequestDto,
  UnitsSummaryRequestDto,
  CategoryStatsRequestDto,
} from '../../backend/solves/dtos/SolveDto';
import { Solve } from '../../backend/common/domains/entities/Solve';

describe('ListSolvesUseCase', () => {
  let useCase: ListSolvesUseCase;
  let mockRepository: jest.Mocked<ISolveRepository>;

  beforeEach(() => {
    mockRepository = {
      findPaginated: jest.fn(),
      countByUnitAndCorrectness: jest.fn(),
      findRecentSamplesByUnit: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new ListSolvesUseCase(mockRepository);
  });

  describe('execute', () => {
    it('should return paginated solves for authenticated user', async () => {
      // Arrange
      const request: ListSolvesRequestDto = {
        userId: 'test-user',
        limit: 10,
        only: 'all',
      };

      const mockSolves = [
        {
          id: 1,
          question: 'Test question',
          answer: 'Test answer',
          helpText: 'Help text',
          userInput: 'User answer',
          isCorrect: true,
          createdAt: new Date(),
          unitId: 1,
          userId: 'test-user',
          unit: {
            id: 1,
            name: 'Test Unit',
            vidUrl: 'http://example.com',
            createdAt: new Date(),
          },
        },
      ] as Array<Solve & { unit: { name: string } }>;

      mockRepository.findPaginated.mockResolvedValue({
        items: mockSolves,
        hasMore: false,
      });

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result).toEqual({
        items: expect.arrayContaining([
          expect.objectContaining({
            id: 1,
            question: 'Test question',
            category: 'Test Unit',
          }),
        ]),
        nextCursor: undefined,
      });
      expect(mockRepository.findPaginated).toHaveBeenCalledWith({
        userId: 'test-user',
        limit: 11, // +1 for hasMore check
        filters: expect.any(Object),
      });
    });

    it('should filter for wrong answers only when only=wrong', async () => {
      // Arrange
      const request: ListSolvesRequestDto = {
        userId: 'test-user',
        limit: 10,
        only: 'wrong',
      };

      mockRepository.findPaginated.mockResolvedValue({
        items: [],
        hasMore: false,
      });

      // Act
      await useCase.execute(request);

      // Assert
      expect(mockRepository.findPaginated).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: expect.objectContaining({
            isCorrect: false,
          }),
        })
      );
    });

    it('should handle date range filtering', async () => {
      // Arrange
      const request: ListSolvesRequestDto = {
        userId: 'test-user',
        limit: 10,
        from: '2024-01-01',
        to: '2024-12-31',
      };

      mockRepository.findPaginated.mockResolvedValue({
        items: [],
        hasMore: false,
      });

      // Act
      await useCase.execute(request);

      // Assert
      expect(mockRepository.findPaginated).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: expect.objectContaining({
            createdAt: {
              gte: new Date('2024-01-01'),
              lte: new Date('2024-12-31'),
            },
          }),
        })
      );
    });
  });
});

describe('GetUnitsSummaryUseCase', () => {
  let useCase: GetUnitsSummaryUseCase;
  let mockRepository: jest.Mocked<ISolveRepository>;

  beforeEach(() => {
    mockRepository = {
      findPaginated: jest.fn(),
      countByUnitAndCorrectness: jest.fn(),
      findRecentSamplesByUnit: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new GetUnitsSummaryUseCase(mockRepository);
  });

  describe('execute', () => {
    it('should return unit summaries with statistics and samples', async () => {
      // Arrange
      const request: UnitsSummaryRequestDto = {
        userId: 'test-user',
        limitPerUnit: 3,
      };

      mockRepository.countByUnitAndCorrectness.mockResolvedValue([
        { unitId: 1, unitName: 'Unit 1', total: 10, correct: 7 },
      ]);

      mockRepository.findRecentSamplesByUnit.mockResolvedValue([
        {
          id: 1,
          question: 'Sample question',
          isCorrect: true,
          createdAt: new Date(),
        },
      ]);

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result).toEqual([
        expect.objectContaining({
          unitId: 1,
          title: 'Unit 1',
          total: 10,
          correct: 7,
          accuracy: 0.7,
          samples: expect.any(Array),
        }),
      ]);
    });
  });
});

describe('GetCategoryStatsUseCase', () => {
  let useCase: GetCategoryStatsUseCase;
  let mockRepository: jest.Mocked<ISolveRepository>;

  beforeEach(() => {
    mockRepository = {
      findPaginated: jest.fn(),
      countByUnitAndCorrectness: jest.fn(),
      findRecentSamplesByUnit: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new GetCategoryStatsUseCase(mockRepository);
  });

  describe('execute', () => {
    it('should return category statistics sorted by Korean locale', async () => {
      // Arrange
      const request: CategoryStatsRequestDto = {
        userId: 'test-user',
      };

      mockRepository.countByUnitAndCorrectness.mockResolvedValue([
        { unitId: 1, unitName: '자연수', total: 10, correct: 8 },
        { unitId: 2, unitName: '가분수', total: 5, correct: 3 },
      ]);

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result).toEqual([
        expect.objectContaining({
          unitId: 2,
          title: '가분수',
          accuracy: 0.6,
        }),
        expect.objectContaining({
          unitId: 1,
          title: '자연수',
          accuracy: 0.8,
        }),
      ]);
    });
  });
});
