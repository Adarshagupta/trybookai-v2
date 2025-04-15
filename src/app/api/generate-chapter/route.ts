import { NextRequest, NextResponse } from 'next/server';
import { generateChapterContent } from '@/utils/gemini';

export async function POST(request: NextRequest) {
  try {
    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not set');
      return NextResponse.json(
        { error: 'API key is not configured. Please set the GEMINI_API_KEY in your .env.local file.' },
        { status: 500 }
      );
    }

    const {
      bookTitle,
      chapterTitle,
      chapterSummary,
      genre,
      tone,
      characters,
      writingStyle,
      detailLevel
    } = await request.json();

    if (!bookTitle || !chapterTitle || !chapterSummary || !genre) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const chapterContent = await generateChapterContent(
      bookTitle,
      chapterTitle,
      chapterSummary,
      genre,
      {
        tone,
        characters,
        writingStyle,
        detailLevel
      }
    );

    // Check if the response contains an error message
    if (chapterContent.includes('Failed to generate') || chapterContent.includes('API key is not configured')) {
      return NextResponse.json(
        { error: chapterContent },
        { status: 500 }
      );
    }

    return NextResponse.json({ content: chapterContent });
  } catch (error) {
    console.error('Error in generate-chapter API:', error);
    return NextResponse.json(
      { error: 'Failed to generate chapter content: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}
