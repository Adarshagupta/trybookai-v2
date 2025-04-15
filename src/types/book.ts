export interface Character {
  name: string;
  role: string; // protagonist, antagonist, supporting
  description: string;
  background?: string;
  motivation?: string;
  traits?: string[];
}

export interface Chapter {
  chapterNumber: number;
  title: string;
  summary: string;
  content?: string;
  keyEvents?: string[];
  characters?: string[]; // Character names that appear in this chapter
}

export interface BookOutline {
  title: string;
  genre: string;
  subgenre?: string;
  description: string;
  targetAudience?: string;
  tone?: string; // serious, humorous, dark, inspirational, etc.
  setting?: string;
  timeframe?: string;
  themes?: string[];
  characters?: Character[];
  chapters: Chapter[];
  writingStyle?: string;
  complexity?: 'simple' | 'moderate' | 'complex';
}

export interface GenerateOutlineFormData {
  topic: string;
  genre: string;
  subgenre?: string;
  length: number;
  tone?: string;
  targetAudience?: string;
  setting?: string;
  includeCharacters?: boolean;
  complexity?: 'simple' | 'moderate' | 'complex';
  writingStyle?: string;
}

export interface GenerateChapterFormData {
  bookTitle: string;
  chapterTitle: string;
  chapterSummary: string;
  genre: string;
  tone?: string;
  characters?: string[];
  writingStyle?: string;
  detailLevel?: 'concise' | 'standard' | 'detailed';
}
