import { z } from "zod";

export const projectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  key: z.string().min(1, "Project key is required"),
  description: z.string().optional(),
});

export const sprintSchema = z.object({
  name: z.string().min(1, "Sprint name is required"),
  startDate: z.date(),
  endDate: z.date(),
});

export const issueSchema = z.object({
  title: z.string().min(1, "Issue title is required"),
  description: z.string().optional(),
  status: z.string(),
  priority: z.string(),
});