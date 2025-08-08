import { z } from "zod";

export const pitchSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be detailed"),
  tags: z.array(z.string()).optional(),
});
