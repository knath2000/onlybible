import { NextResponse } from 'next/server';

interface BibleVerse {
  reference: string;
  text: string;
  translation: string;
  verse: number;
  chapter: number;
  book: string;
}

interface BibleChapter {
  reference: string;
  verses: BibleVerse[];
  chapter: number;
  book: string;
  translation: string;
}

interface ApiError {
  message: string;
  code: string;
  status: number;
}

const BIBLE_API_BASE = 'https://biblia-api.vercel.app/api/v1';

/**
 * GET /api/bible?book=Génesis&chapter=1&verse=1
 * Fetches a specific Bible verse
 */
export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const book = searchParams.get('book');
  const chapter = searchParams.get('chapter');
  const verse = searchParams.get('verse');

  // Validate required parameters
  if (!book || !chapter) {
    return NextResponse.json(
      { error: 'Missing required parameters: book and chapter are required' },
      { status: 400 }
    );
  }

  try {
    let apiUrl: string;
    let isVerseRequest = false;

    if (verse) {
      // Fetch specific verse
      apiUrl = `${BIBLE_API_BASE}/${encodeURIComponent(book.toLowerCase())}/${chapter}/${verse}`;
      isVerseRequest = true;
    } else {
      // Fetch entire chapter
      apiUrl = `${BIBLE_API_BASE}/${encodeURIComponent(book.toLowerCase())}/${chapter}`;
    }

    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      // Add timeout
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      // Return error response with fallback
      return NextResponse.json(
        {
          error: 'Failed to fetch Bible content',
          message: 'Using fallback content due to API issues',
          code: 'API_ERROR'
        },
        { status: 500 }
      );
    }

    const data = await response.json();

    if (isVerseRequest) {
      // Format verse response
      const result: BibleVerse = {
        reference: `${book} ${chapter}:${verse}`,
        text: data.text || data.texto || 'Versículo no encontrado',
        translation: 'rvr60',
        verse: parseInt(verse || '1'),
        chapter: parseInt(chapter),
        book: book
      };

      return NextResponse.json(result);
    } else {
      // Format chapter response
      const result: BibleChapter = {
        reference: `${book} ${chapter}`,
        verses: Array.isArray(data.verses) ? data.verses : [],
        chapter: parseInt(chapter),
        book: book,
        translation: 'rvr60'
      };

      return NextResponse.json(result);
    }
  } catch (error) {
    console.error('Bible API Error:', error);

    // Handle different error types
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Request timeout. Please try again.' },
          { status: 408 }
        );
      }
    }

    // Return error response with fallback
    return NextResponse.json(
      {
        error: 'Failed to fetch Bible content',
        message: 'Using fallback content due to API issues',
        code: 'API_ERROR'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/bible
 * Alternative endpoint for fetching Bible content with body parameters
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { book, chapter, verse } = body;

    if (!book || !chapter) {
      return NextResponse.json(
        { error: 'Missing required parameters: book and chapter are required' },
        { status: 400 }
      );
    }

    // Use the same logic as GET but with proper NextResponse handling
    let apiUrl: string;
    let isVerseRequest = false;

    if (verse) {
      apiUrl = `${BIBLE_API_BASE}/${encodeURIComponent(book.toLowerCase())}/${chapter}/${verse}`;
      isVerseRequest = true;
    } else {
      apiUrl = `${BIBLE_API_BASE}/${encodeURIComponent(book.toLowerCase())}/${chapter}`;
    }

    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (isVerseRequest) {
      const result: BibleVerse = {
        reference: `${book} ${chapter}:${verse}`,
        text: data.text || data.texto || 'Versículo no encontrado',
        translation: 'rvr60',
        verse: parseInt(verse || '1'),
        chapter: parseInt(chapter),
        book: book
      };

      return NextResponse.json(result);
    } else {
      const result: BibleChapter = {
        reference: `${book} ${chapter}`,
        verses: Array.isArray(data.verses) ? data.verses : [],
        chapter: parseInt(chapter),
        book: book,
        translation: 'rvr60'
      };

      return NextResponse.json(result);
    }
  } catch (error) {
    console.error('Bible API POST Error:', error);
    return NextResponse.json(
      { error: 'Invalid request body or API error' },
      { status: 400 }
    );
  }
}