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
 * GET /api/bible
 * Fetches Bible content from Free RVR60 API (biblia-api.vercel.app)
 * Supports three modes:
 * - Meta mode: ?meta=1&book=X&chapter=Y (returns chapterVerseCount)
 * - Range mode: ?book=X&chapter=Y&startVerse=A&endVerse=B (returns verse range)
 * - Single mode: ?book=X&chapter=Y&verse=V (returns single verse)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);

    // Required parameters
    const book = searchParams.get('book');
    const chapter = searchParams.get('chapter');

    if (!book || !chapter) {
      return NextResponse.json({
        error: 'Missing required parameters: book and chapter are required',
        example: '/api/bible?book=Génesis&chapter=1&verse=1'
      }, { status: 400 });
    }

    const normalizedBook = normalizeText(book).toLowerCase();
    const chapterNum = parseInt(chapter);
    const bibleApiBase = 'https://biblia-api.vercel.app/api/v1';

    // Check if this is a meta request
    if (searchParams.get('meta') === '1') {
      // Meta mode: return chapter metadata
      const chapterUrl = `${bibleApiBase}/${normalizedBook}/${chapterNum}`;
      const chapterRes = await fetch(chapterUrl);

      if (!chapterRes.ok) {
        return NextResponse.json({
          error: 'Failed to fetch chapter metadata',
          status: chapterRes.status
        }, { status: 404 });
      }

      const chapterData = await chapterRes.json();

      return NextResponse.json({
        book: book,
        chapter: chapterNum,
        chapterVerseCount: chapterData.verses
      }, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Cache-Control': 'public, max-age=86400'
        }
      });
    }

    // Check for range mode (both startVerse and endVerse present)
    const hasStart = searchParams.has('startVerse');
    const hasEnd = searchParams.has('endVerse');
    const hasVerse = searchParams.has('verse');

    if (hasStart && hasEnd) {
      // Range mode: fetch whole chapter and slice
      const startVerse = parseInt(searchParams.get('startVerse')!);
      const endVerse = parseInt(searchParams.get('endVerse')!);

      if (!isFinite(startVerse) || !isFinite(endVerse) || startVerse > endVerse) {
        return NextResponse.json({
          error: 'Invalid verse range',
          details: 'startVerse must be <= endVerse and both must be valid numbers'
        }, { status: 400 });
      }

      // Fetch whole chapter
      const chapterUrl = `${bibleApiBase}/${normalizedBook}/${chapterNum}`;
      const chapterRes = await fetch(chapterUrl);

      if (!chapterRes.ok) {
        return NextResponse.json({
          error: 'Chapter not found',
          status: chapterRes.status
        }, { status: 404 });
      }

      const chapterData = await chapterRes.json();
      // Validate upstream response shape to avoid emitting placeholder/error verses.
      // The upstream chapter endpoint should return:
      // { book: string, chapter: number, verses: number, text: string[] }
      if (
        !chapterData ||
        typeof chapterData.verses !== 'number' ||
        !Number.isFinite(chapterData.verses) ||
        !Array.isArray(chapterData.text)
      ) {
        return NextResponse.json(
          {
            error: 'Invalid chapter response from upstream API',
            details: {
              book: normalizedBook,
              chapter: chapterNum,
              versesType: typeof chapterData?.verses,
              textIsArray: Array.isArray(chapterData?.text),
            },
          },
          { status: 500 }
        );
      }

      // Clamp range to available verses
      const safeStart = Math.max(1, startVerse);
      const safeEnd = Math.min(endVerse, chapterData.verses);

      // If requested range is completely beyond available verses, return empty
      if (safeEnd < safeStart) {
        return NextResponse.json({
          verses: [],
          total: 0,
          reference: `${book} ${chapterNum}:${startVerse}-${endVerse}`,
          chapterVerseCount: chapterData.verses
        }, {
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Cache-Control': 'public, max-age=86400'
          }
        });
      }

      // Slice the verses array (text array is 0-based, verses are 1-based)
      const slicedVerses = chapterData.text.slice(safeStart - 1, safeEnd).map((text: string, i: number) => ({
        verse: safeStart + i,
        text: text || 'Verse not available'
      }));

      return NextResponse.json({
        verses: slicedVerses,
        total: slicedVerses.length,
        reference: `${book} ${chapterNum}:${safeStart}-${safeEnd}`,
        chapterVerseCount: chapterData.verses
      }, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Cache-Control': 'public, max-age=86400'
        }
      });

    } else if (hasVerse) {
      // Single verse mode: efficient direct fetch
      const verseNum = parseInt(searchParams.get('verse')!);

      if (!isFinite(verseNum)) {
        return NextResponse.json({
          error: 'Invalid verse number',
          details: 'verse must be a valid number'
        }, { status: 400 });
      }

      const verseUrl = `${bibleApiBase}/${normalizedBook}/${chapterNum}/${verseNum}`;
      const verseRes = await fetch(verseUrl);

      if (!verseRes.ok) {
        return NextResponse.json({
          error: 'Verse not found',
          verses: [],
          reference: `${book} ${chapterNum}:${verseNum}`
        }, {
          status: 404,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          }
        });
      }

      const verseData = await verseRes.json();

      const verses = [{
        verse: verseNum,
        text: verseData.text || 'Verse not found'
      }];

      return NextResponse.json({
        verses,
        total: verses.length,
        reference: `${book} ${chapterNum}:${verseNum}`
      }, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Cache-Control': 'public, max-age=86400'
        }
      });

    } else {
      // No valid mode specified
      return NextResponse.json({
        error: 'Invalid request mode',
        details: 'Specify either: meta=1, or startVerse&endVerse, or verse',
        examples: [
          '/api/bible?book=Génesis&chapter=1&meta=1',
          '/api/bible?book=Génesis&chapter=1&startVerse=1&endVerse=5',
          '/api/bible?book=Génesis&chapter=1&verse=1'
        ]
      }, { status: 400 });
    }
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