import { NextRequest, NextResponse } from 'next/server';
import { normalizeText } from '../../../lib/utils'; // Corrected path

interface BibleVerse {
  reference: string;
  text: string;
  translation: string;
  verse: number;
  chapter: number;
  book: string;
}

/**
 * GET /api/bible?passage=Juan+3:16
 * Fetches Bible content from Free RVR60 API (biblia-api.vercel.app) with enhanced error handling
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const book = searchParams.get('book') || 'genesis'; // Default for testing
    const chapter = parseInt(searchParams.get('chapter') || '1');
    const startVerse = parseInt(searchParams.get('startVerse') || '1');
    const endVerse = parseInt(searchParams.get('endVerse') || '1');
    const verse = parseInt(searchParams.get('verse') || '0'); // Backward compat for single

    if (!book || !chapter) {
      return NextResponse.json({ error: 'Missing book or chapter' }, { status: 400 });
    }

    const normalizedBook = normalizeText(book).toLowerCase(); // e.g., "Génesis" -> "genesis"
    const bibleApiBase = 'https://biblia-api.vercel.app/api/v1';

    let verses: any[] = [];
    if (startVerse && endVerse && startVerse <= endVerse) {
      // Range fetching - batch parallel single-verse calls
      const versePromises = [];
      for (let v = startVerse; v <= endVerse; v++) {
        versePromises.push(
          fetch(`${bibleApiBase}/${normalizedBook}/${chapter}/${v}`)
            .then(res => res.ok ? res.json() : Promise.reject(new Error(`Verse ${v} failed`)))
            .catch(err => ({ verse: v, text: `Error loading verse ${v}: ${err.message}`, error: true })) // Partial fallback
        );
      }
      verses = await Promise.all(versePromises);
    } else if (verse) {
      // Existing single-verse logic (unchanged)
      const res = await fetch(`${bibleApiBase}/${normalizedBook}/${chapter}/${verse}`);
      if (!res.ok) throw new Error('API fetch failed');
      const data = await res.json();
      verses = [{ verse, text: data.text || 'Verse not found', reference: `${book} ${chapter}:${verse}` }];
    }

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Cache-Control': 'public, max-age=86400', // 24h
      'ETag': `range-${normalizedBook}-${chapter}-${startVerse}-${endVerse || verse}`,
    };

    return NextResponse.json(
      { verses, total: verses.length, reference: `${book} ${chapter}:${startVerse}-${endVerse || verse}` },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error('Bible API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch verses. Try again or check connection.', verses: [] },
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' } }
    );
  }
}

/**
 * POST /api/bible
 * Alternative endpoint for fetching Bible content with body parameters
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { bibleId = 'RVR60', passage, format = 'html' } = body;

    if (!passage) {
      return NextResponse.json(
        { error: 'Missing required parameter: passage is required' },
        { status: 400 }
      );
    }

    // Use the same logic as GET but with proper NextResponse handling
    const apiKey = process.env.BIBLIA_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured. Please set BIBLIA_API_KEY in .env.local' },
        { status: 500 }
      );
    }

    // Clean and format passage for API
    const cleanPassage = passage.replace(/\s+/g, '+');
    
    // Construct Biblia.com API URL
    const apiUrl = `https://api.biblia.com/v1/bible/content/${bibleId}.${format}?passage=${encodeURIComponent(cleanPassage)}&key=${apiKey}`;

    console.log('Biblia.com API POST Request:', {
      bibleId,
      passage: cleanPassage,
      format,
      apiUrl: apiUrl.replace(apiKey, '***HIDDEN***'),
      timestamp: new Date().toISOString()
    });

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': format === 'html' ? 'text/html' : 'text/plain',
        'Content-Type': 'application/json',
        'User-Agent': 'BibleApp/1.0 (Next.js App Router)'
      },
      signal: AbortSignal.timeout(15000),
    });

    console.log('Biblia.com API POST Response:', {
      status: response.status,
      statusText: response.statusText
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Biblia.com API POST Error Response:', {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText
      });

      return NextResponse.json(
        {
          error: `Biblia.com API error: ${response.status} ${response.statusText}`,
          details: errorText,
          bibleId: bibleId,
          passage: cleanPassage
        },
        { status: response.status }
      );
    }

    const content = await response.text();
    
    // Return HTML content directly for better formatting
    if (format === 'html') {
      return new NextResponse(content, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=3600'
        },
      });
    } else {
      // Parse passage to extract book, chapter, verse
      const passageParts = cleanPassage.split(':');
      const book = passageParts[0].replace(/\+/g, ' ');
      const chapterVerse = passageParts[1] || '';
      const chapter = parseInt(chapterVerse.split('-')[0].split(',')[0] || '1');
      const verse = passageParts.length > 1 ? parseInt(chapterVerse.split(':')[1] || '1') : 1;

      const result: BibleVerse = {
        reference: `${book} ${chapter}:${verse}`,
        text: content.trim(),
        translation: bibleId,
        verse: verse,
        chapter: chapter,
        book: book
      };

      return NextResponse.json(result);
    }
  } catch (error) {
    console.error('Bible API POST Error:', error);
    return NextResponse.json(
      {
        error: 'Invalid request body or API error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 400, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' } }
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
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    }
  );
}