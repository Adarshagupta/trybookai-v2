import { NextRequest, NextResponse } from 'next/server';
import { generateBookOutline } from '@/utils/gemini';

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
      topic,
      genre,
      length,
      subgenre,
      tone,
      targetAudience,
      setting,
      includeCharacters,
      complexity,
      writingStyle
    } = await request.json();

    if (!topic || !genre || !length) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const outline = await generateBookOutline(
      topic,
      genre,
      parseInt(length),
      {
        subgenre,
        tone,
        targetAudience,
        setting,
        includeCharacters,
        complexity,
        writingStyle
      }
    );

    // Check if there was an error in the outline generation
    if ('error' in outline) {
      return NextResponse.json(
        { error: outline.error },
        { status: 500 }
      );
    }

    return NextResponse.json(outline);
  } catch (error) {
    console.error('Error in generate-outline API:', error);
    return NextResponse.json(
      { error: 'Failed to generate book outline: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}
