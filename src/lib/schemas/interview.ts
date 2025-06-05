import { z } from "zod";

// Interview schema (matches your interview table)
export const InterviewSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  domain: z
    .string()
    .min(1, "Domain is required")
    .max(100, "Domain cannot exceed 100 characters"),
  status: z.enum(["scheduled", "completed", "cancelled"]).default("scheduled"),
  questions: z.array(z.string()).default([]),
  generatedAt: z.date().default(() => new Date()),
  candidateId: z.string().uuid(),
});

// Interview scheduling schema
export const ScheduleInterviewSchema = z.object({
  candidateId: z.string().uuid("Invalid candidate ID"),
  domain: z
    .string()
    .min(1, "Domain is required")
    .max(100, "Domain cannot exceed 100 characters"),
  questions: z
    .array(z.string())
    .min(1, "At least one question is required")
    .max(20, "Cannot have more than 20 questions"),
  scheduledDate: z
    .date()
    .min(new Date(), "Interview date must be in the future"),
});

// Type exports
export type Interview = z.infer<typeof InterviewSchema>;
export type ScheduleInterview = z.infer<typeof ScheduleInterviewSchema>;
