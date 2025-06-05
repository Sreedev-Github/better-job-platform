import { z } from "zod";

// Application schema (matches your applications table)
export const ApplicationSchema = z.object({
  id: z.string().uuid(),
  jobId: z.string().uuid(),
  candidateId: z.string().uuid(),
  appliedAt: z.date().default(() => new Date()),
  status: z
    .enum(["pending", "reviewing", "interview", "rejected", "accepted"])
    .default("pending"),
});

// Application creation schema
export const CreateApplicationSchema = z.object({
  jobId: z.string().uuid("Invalid job ID"),
  coverLetter: z
    .string()
    .max(1000, "Cover letter cannot exceed 1000 characters")
    .optional(),
});

// Application status update schema
export const UpdateApplicationStatusSchema = z.object({
  status: z.enum(["pending", "reviewing", "interview", "rejected", "accepted"]),
  notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
});

// Type exports
export type Application = z.infer<typeof ApplicationSchema>;
export type CreateApplication = z.infer<typeof CreateApplicationSchema>;
export type UpdateApplicationStatus = z.infer<
  typeof UpdateApplicationStatusSchema
>;
