import { z } from "zod";

// Job schema (matches your jobs table)
export const JobSchema = z.object({
  id: z.string().uuid(),
  hrId: z.string().uuid(),
  title: z
    .string()
    .min(1, "Job title is required")
    .max(200, "Job title cannot exceed 200 characters")
    .trim(),
  description: z
    .string()
    .min(1, "Job description is required")
    .min(50, "Job description must be at least 50 characters"),
  category: z
    .string()
    .min(1, "Category is required")
    .max(100, "Category cannot exceed 100 characters"),
  salaryRange: z
    .string()
    .min(1, "Salary range is required")
    .max(100, "Salary range cannot exceed 100 characters"),
  location: z
    .string()
    .min(1, "Location is required")
    .max(200, "Location cannot exceed 200 characters"),
  createdAt: z.date().default(() => new Date()),
});

// Job posting schema (for creating/updating jobs)
export const JobPostingSchema = z.object({
  title: z
    .string()
    .min(1, "Job title is required")
    .max(200, "Job title cannot exceed 200 characters")
    .trim(),
  description: z
    .string()
    .min(1, "Job description is required")
    .min(50, "Job description must be at least 50 characters"),
  category: z
    .string()
    .min(1, "Category is required")
    .max(100, "Category cannot exceed 100 characters"),
  salaryRange: z
    .string()
    .min(1, "Salary range is required")
    .max(100, "Salary range cannot exceed 100 characters"),
  location: z
    .string()
    .min(1, "Location is required")
    .max(200, "Location cannot exceed 200 characters"),
});

// Job search/filter schema
export const JobSearchSchema = z.object({
  title: z.string().optional(),
  category: z.string().optional(),
  location: z.string().optional(),
  salaryMin: z.number().min(0).optional(),
  salaryMax: z.number().min(0).optional(),
});

// Type exports
export type Job = z.infer<typeof JobSchema>;
export type JobPosting = z.infer<typeof JobPostingSchema>;
export type JobSearch = z.infer<typeof JobSearchSchema>;
