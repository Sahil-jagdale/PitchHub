import { z } from "zod";

export const pitchValidationSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be at most 100 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  tags: z.array(z.string().min(1)).max(10).optional(),
  fundingRequired: z.preprocess(
    (val) => Number(val),
    z.number().positive("Funding must be positive")
  ),
  equityOffered: z.number().min(0).max(100).optional(),
  valuation: z.number().positive().optional(),
  stage: z.enum(["idea", "MVP", "growth", "scaling"]).optional(),
  industry: z.string().optional(),
  pitchDeckUrl: z.string().url("Must be a valid URL").optional(),
  images: z.array(z.string().url("Image must be a valid URL")).optional(),
  isPublic: z.boolean().default(true),
});
