import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if the request is for the API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Check if the API key is set
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key is not configured. Please set the GEMINI_API_KEY environment variable.' },
        { status: 500 }
      );
    }
  }

  return NextResponse.next();
}

// Only run the middleware on API routes
export const config = {
  matcher: '/api/:path*',
};
