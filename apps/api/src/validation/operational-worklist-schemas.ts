import { z } from "zod";

export const operationalWorklistQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(10)
});

export type OperationalWorklistQuery = z.infer<typeof operationalWorklistQuerySchema>;
