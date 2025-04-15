import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Initialize the Google Generative AI with the API key
// Note: In Next.js, process.env is only available on the server side
// For client components, we need to use environment variables prefixed with NEXT_PUBLIC_
const getGeminiAI = () => {
  // Check if we're on the server side
  if (typeof window === 'undefined') {
    return new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  } else {
    // For client-side, we would use NEXT_PUBLIC_ prefixed env vars
    // But for this app, we're only using the API on the server side
    return null;
  }
};

// Safety settings to avoid harmful content
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

// Get the Gemini Pro model
export const getGeminiModel = () => {
  const genAI = getGeminiAI();
  if (!genAI) {
    throw new Error('Gemini API is not available in this environment');
  }
  return genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    safetySettings,
  });
};

// Generate a book outline based on user input with advanced options
export async function generateBookOutline(
  topic: string,
  genre: string,
  length: number,
  options: {
    subgenre?: string;
    tone?: string;
    targetAudience?: string;
    setting?: string;
    includeCharacters?: boolean;
    complexity?: 'simple' | 'moderate' | 'complex';
    writingStyle?: string;
  } = {}
) {
  const model = getGeminiModel();

  // Extract options with defaults
  const {
    subgenre = '',
    tone = '',
    targetAudience = '',
    setting = '',
    includeCharacters = false,
    complexity = 'moderate',
    writingStyle = ''
  } = options;

  // Build a more detailed prompt based on the options
  const prompt = `
    You are a professional book outline generator with expertise in all literary genres.
    Create a detailed, well-structured book outline on the topic: "${topic}".

    BOOK SPECIFICATIONS:
    - Primary Genre: ${genre}
    ${subgenre ? `- Subgenre: ${subgenre}` : ''}
    - Number of chapters: ${length}
    ${tone ? `- Tone/Mood: ${tone}` : ''}
    ${targetAudience ? `- Target Audience: ${targetAudience}` : ''}
    ${setting ? `- Setting: ${setting}` : ''}
    ${writingStyle ? `- Writing Style: ${writingStyle}` : ''}
    - Complexity Level: ${complexity}

    REQUIREMENTS:
    1. Create a compelling and original title that fits the genre and topic
    2. Write a detailed description (3-5 sentences) that would entice readers
    3. Include ${length} well-structured chapters with logical progression
    4. For each chapter, provide:
       a. An engaging chapter title
       b. A detailed summary (2-4 sentences)
       ${complexity === 'complex' ? 'c. 2-3 key events that occur in the chapter' : ''}
    ${includeCharacters ? `5. Create 3-5 main characters with:
       a. Character name
       b. Role in the story (protagonist, antagonist, supporting)
       c. Brief description
       d. Motivation` : ''}
    ${complexity === 'complex' ? '6. Include 2-4 major themes explored in the book' : ''}

    Format the response as JSON with the following structure:
    {
      "title": "Main book title",
      "genre": "${genre}",
      "description": "Overall book description",
      "chapters": [
        {
          "chapterNumber": 1,
          "title": "Chapter title",
          "summary": "Detailed chapter summary"
        }
      ]
    }

    If subgenre is provided, include it in the JSON as "subgenre".
    If tone is provided, include it in the JSON as "tone".
    If targetAudience is provided, include it in the JSON as "targetAudience".
    If setting is provided, include it in the JSON as "setting".

    If complexity is 'complex', include a "themes" array with 2-4 themes.
    If complexity is 'complex', include a "keyEvents" array for each chapter with 2-3 key events.

    If includeCharacters is true, include a "characters" array with objects containing:
    - name
    - role (protagonist, antagonist, supporting)
    - description
    - motivation

    Ensure the outline is coherent, engaging, and follows a logical narrative structure with proper setup, development, and resolution.
  `;

  try {
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not set');
      return { error: 'API key is not configured. Please set the GEMINI_API_KEY in your .env.local file.' };
    }

    // Format the request according to the Gemini API requirements
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    console.log('Gemini API response:', text);

    // Extract the JSON from the response
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/{[\s\S]*}/);

    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1] || jsonMatch[0]);
      } catch (e) {
        console.error('Failed to parse JSON:', e);
        return { error: 'Failed to parse book outline' };
      }
    }

    // If we couldn't extract JSON, try to create a simple structure from the text
    try {
      const lines = text.split('\n').filter(line => line.trim());
      const title = lines[0] || 'Generated Book';
      const description = lines.slice(1, 3).join(' ') || 'A book about ' + topic;

      // Try to extract chapters
      const chapters = [];
      let currentChapter = null;

      for (let i = 3; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.match(/^Chapter \d+|^\d+\./) || line.match(/^[\w\s]+:$/)) {
          // This looks like a chapter title
          if (currentChapter && currentChapter.title) {
            chapters.push(currentChapter);
          }
          currentChapter = {
            chapterNumber: chapters.length + 1,
            title: line.replace(/^Chapter \d+[:.\s]*|^\d+\.\s*|:$/g, '').trim(),
            summary: ''
          };
        } else if (currentChapter && line) {
          // Add to the current chapter summary
          currentChapter.summary += (currentChapter.summary ? ' ' : '') + line;
        }
      }

      // Add the last chapter if it exists
      if (currentChapter && currentChapter.title) {
        chapters.push(currentChapter);
      }

      // If we couldn't extract chapters, create some default ones
      if (chapters.length === 0) {
        for (let i = 1; i <= length; i++) {
          chapters.push({
            chapterNumber: i,
            title: `Chapter ${i}`,
            summary: `Content for chapter ${i} about ${topic}.`
          });
        }
      }

      return {
        title,
        genre,
        description,
        chapters
      };
    } catch (e) {
      console.error('Failed to create fallback structure:', e);
      return { error: 'Failed to generate book outline' };
    }
  } catch (error) {
    console.error('Error generating book outline:', error);
    return { error: 'Failed to generate book outline. ' + (error instanceof Error ? error.message : String(error)) };
  }
}

// Generate chapter content based on the outline with advanced options
export async function generateChapterContent(
  bookTitle: string,
  chapterTitle: string,
  chapterSummary: string,
  genre: string,
  options: {
    tone?: string;
    characters?: string[];
    writingStyle?: string;
    detailLevel?: 'concise' | 'standard' | 'detailed';
  } = {}
) {
  const model = getGeminiModel();

  // Extract options with defaults
  const {
    tone = '',
    characters = [],
    writingStyle = '',
    detailLevel = 'standard'
  } = options;

  // Determine word count based on detail level
  const wordCount = {
    concise: '800-1200',
    standard: '1200-1800',
    detailed: '1800-2500'
  }[detailLevel];

  // Build a more detailed prompt based on the options
  const prompt = `
    You are a professional fiction writer with expertise in the ${genre} genre.
    Write a detailed, engaging chapter for a book with the following information:

    CHAPTER SPECIFICATIONS:
    - Book Title: "${bookTitle}"
    - Genre: ${genre}
    - Chapter Title: "${chapterTitle}"
    - Chapter Summary: "${chapterSummary}"
    ${tone ? `- Tone/Mood: ${tone}` : ''}
    ${writingStyle ? `- Writing Style: ${writingStyle}` : ''}
    - Detail Level: ${detailLevel}

    ${characters.length > 0 ? `CHARACTERS APPEARING IN THIS CHAPTER:
    ${characters.map(character => `- ${character}`).join('\n')}
    ` : ''}

    WRITING GUIDELINES:
    1. Create a well-structured, engaging chapter that fits the genre and summary provided
    2. Include descriptive language, sensory details, and immersive world-building
    3. Incorporate natural dialogue where appropriate
    4. Maintain a consistent narrative voice and perspective
    5. Balance action, description, and character development
    6. The chapter should be approximately ${wordCount} words
    7. Format the text with proper paragraphs and spacing
    8. Begin and end the chapter in a compelling way

    Write the chapter content only, without any additional notes or explanations.
  `;

  try {
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not set');
      return 'API key is not configured. Please set the GEMINI_API_KEY in your .env.local file.';
    }

    // Format the request according to the Gemini API requirements
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating chapter content:', error);
    return 'Failed to generate chapter content. ' + (error instanceof Error ? error.message : String(error));
  }
}
