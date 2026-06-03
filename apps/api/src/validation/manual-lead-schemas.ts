import { z } from "zod";

export const manualLeadCreateSchema = z.object({
  tutorName: z.string().trim().min(1).optional(),
  phone: z.string().trim().min(1),
  entryMethod: z.string().trim().min(1),
  attendant: z.string().trim().min(1),
  entryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  nextAction: z.string().trim().min(1),
  nextActionAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  petName: z.string().trim().min(1).optional(),
  breed: z.string().trim().min(1).optional(),
  estimatedWeight: z.string().trim().min(1).optional(),
  serviceInterest: z.string().trim().min(1).optional(),
  sourceDetail: z.string().trim().min(1).optional(),
  campaign: z.string().trim().min(1).optional(),
  additionalNote: z.string().trim().min(1).optional(),
  initialNote: z.string().trim().min(1).optional()
});

export type ManualLeadCreateInput = z.infer<typeof manualLeadCreateSchema>;
