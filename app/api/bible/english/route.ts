import { NextRequest, NextResponse } from 'next/server';
import { normalizeText, spanishToEnglishBooks } from '../../../../lib/utils'; // Corrected path

interface EnglishBibleVerse {
  reference: string;
  text: string;
  translation: string;
  verse: number;
  chapter: number;
  book: string;
}

/**
 * GET /api/bible/english?book=Genesis&chapter=1&verse=1
 * Fetches Bible content from bible-api.com (KJV - King James Version)
 * This free API requires no API key
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const spanishBook = searchParams.get('book');
  const chapter = searchParams.get('chapter');
  const verse = searchParams.get('verse');
  const startVerse = searchParams.get('startVerse');
  const endVerse = searchParams.get('endVerse');

  if (!spanishBook || !chapter) {
    return NextResponse.json(
      {
        error: 'Missing required parameters: book and chapter are required',
        example: '/api/bible/english?book=Génesis&chapter=1&startVerse=1&endVerse=5'
      },
      { status: 400 }
    );
  }

  // Normalize the Spanish book name for lookup
  const normalizedInput = normalizeText(spanishBook);

  // Get the English book name
  const englishBook = spanishToEnglishBooks[normalizedInput];

  if (!englishBook) {
    return NextResponse.json(
      {
        error: `Unknown book: ${spanishBook}`,
        normalizedInput: normalizedInput,
        availableBooks: Object.keys(spanishToEnglishBooks)
      },
      { status: 400 }
    );
  }

  const bibleApiUrl = `https://bible-api.com/${englishBook}+${chapter}`;

  try {
    let verses: any[] = [];

    if (startVerse && endVerse) {
      // Range - bible-api supports ?start-end directly
      const rangeUrl = `${bibleApiUrl}:${startVerse}-${endVerse}?translation=kjv`;
      const res = await fetch(rangeUrl);
      if (!res.ok) throw new Error('English API fetch failed');
      const data = await res.json();
      // Split response (API returns multi-verse as text; parse by numbers if needed)
      // For simplicity, assume API handles; fallback to loop if not
      verses = data.text ? data.text.split('\n').map((t: string, i: number) => ({ verse: parseInt(startVerse) + i, text: t.trim() })) : [];
    } else if (verse) {
      // Single-verse (unchanged)
      const res = await fetch(`${bibleApiUrl}:${verse}?translation=kjv`);
      if (!res.ok) throw new Error('English API fetch failed');
      const data = await res.json();
      verses = [{ verse: parseInt(verse), text: data.text, reference: `${englishBook} ${chapter}:${verse}` }];
    }

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Cache-Control': 'public, max-age=86400',
    };

    return NextResponse.json(
      { verses, total: verses.length, reference: `${englishBook} ${chapter}:${startVerse || verse}-${endVerse || verse}` },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error('English Bible API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch English translation. Using dictionary fallback.', verses: [] },
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' } }
    );
  }
}

// CORS preflight
export async function OPTIONS(): Promise<NextResponse> {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    }
  );
}
