import { z } from "zod";

export const generateAIAdminSchema = z.object({
  action: z.enum(["rephrase-title", "generate-desc"]),
  title: z.string().optional(),
  unit: z.string().optional(),
  description: z.string().optional(),
});

export type GenerateAIAdminInput = z.infer<typeof generateAIAdminSchema>;
