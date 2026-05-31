import { z } from "zod";

export const uuidSchema = z.string().uuid();
export const dateTimeSchema = z.string().datetime({ offset: true });

export const paginationQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0)
});

export function validateBody<T>(schema: z.ZodType<T>, body: unknown): T {
  return schema.parse(body);
}

export function validateQuery<T>(schema: z.ZodType<T>, query: unknown): T {
  return schema.parse(query);
}

export function validateParams<T>(schema: z.ZodType<T>, params: unknown): T {
  return schema.parse(params);
}
