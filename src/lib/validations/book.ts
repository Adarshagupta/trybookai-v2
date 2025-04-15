import { z } from 'zod';

export const generateOutlineSchema = z.object({
  topic: z.string().min(3, 'Topic must be at least 3 characters'),
  genre: z.string().min(3, 'Genre must be at least 3 characters'),
  subgenre: z.string().optional(),
  length: z.number().min(1, 'Must have at least 1 chapter').max(20, 'Maximum 20 chapters'),
  tone: z.string().optional(),
  targetAudience: z.string().optional(),
  setting: z.string().optional(),
  includeCharacters: z.boolean().optional().default(false),
  complexity: z.enum(['simple', 'moderate', 'complex']).optional().default('moderate'),
  writingStyle: z.string().optional(),
});

export const generateChapterSchema = z.object({
  bookTitle: z.string().min(3, 'Book title must be at least 3 characters'),
  chapterTitle: z.string().min(3, 'Chapter title must be at least 3 characters'),
  chapterSummary: z.string().min(10, 'Summary must be at least 10 characters'),
  genre: z.string().min(3, 'Genre must be at least 3 characters'),
  tone: z.string().optional(),
  characters: z.array(z.string()).optional(),
  writingStyle: z.string().optional(),
  detailLevel: z.enum(['concise', 'standard', 'detailed']).optional().default('standard'),
});

export const characterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.string().min(3, 'Role must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  background: z.string().optional(),
  motivation: z.string().optional(),
  traits: z.array(z.string()).optional(),
});
