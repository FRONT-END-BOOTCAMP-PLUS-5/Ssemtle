import { z } from 'zod';

export const ListSolvesQuery = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  only: z.enum(['wrong', 'all']).default('all'),
  limit: z.number().int().min(1).max(100).default(20),
  cursor: z.string().optional(),
});

export type ListSolvesQuery = z.infer<typeof ListSolvesQuery>;

export const UnitsSummaryQuery = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  limitPerUnit: z.number().int().min(1).max(10).default(3),
});

export type UnitsSummaryQuery = z.infer<typeof UnitsSummaryQuery>;

export const CategoryStatsQuery = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

export type CategoryStatsQuery = z.infer<typeof CategoryStatsQuery>;
