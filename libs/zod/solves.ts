import { z } from 'zod';

export const ListSolvesQuery = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  only: z.enum(['wrong', 'all']).default('all'),
  limit: z.number().int().min(1).max(100).default(20),
  cursor: z.string().optional(),
  direction: z.enum(['next', 'prev']).default('next'),
  sortDirection: z.enum(['newest', 'oldest']).default('newest'),
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

export const UpdateSolveBody = z.object({
  userInput: z
    .string()
    .min(1, 'userInput is required')
    .max(2000, 'userInput too long'),
});

export type UpdateSolveBody = z.infer<typeof UpdateSolveBody>;

export const CalendarSolvesQuery = z
  .object({
    month: z
      .string()
      .regex(/^\d{4}-\d{2}$/)
      .optional(), // YYYY-MM format
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
    only: z.enum(['wrong', 'all']).default('all'),
  })
  .refine((data) => data.month || (data.from && data.to), {
    message: "Either 'month' or both 'from' and 'to' must be provided",
  });

export type CalendarSolvesQuery = z.infer<typeof CalendarSolvesQuery>;
