import { NextRequest, NextResponse } from 'next/server';

interface BibleVerse {
  reference: string;
  text: string;
  translation: string;
  verse: number;
  chapter: number;
  book: string;
}

/**
 * Normalize text by removing accents/diacritics and converting to lowercase
 * This ensures consistent matching regardless of character encoding
 */
function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * GET /api/bible?passage=Juan+3:16
 * Fetches Bible content from Free RVR60 API (biblia-api.vercel.app) with enhanced error handling
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const passage = searchParams.get('passage');
  
  // Extract book, chapter, verse from passage like "Juan+3:16" or "Juan 3:16"
  if (!passage) {
    return NextResponse.json(
      {
        error: 'Missing required parameter: passage is required',
        example: 'Juan 3:16 or Juan+3:16'
      },
      { status: 400 }
    );
  }

  // Parse passage: "Juan+3:16" -> book="Juan", chapter=3, verse=16
  const cleanPassage = passage.replace(/\s+/g, '+');
  const passageParts = cleanPassage.split(':');
  const bookChapter = passageParts[0];
  const verse = passageParts.length > 1 ? parseInt(passageParts[1]) : 1;
  
  const bookChapterParts = bookChapter.split('+');
  const spanishBookName = bookChapterParts[0];
  const chapter = bookChapterParts.length > 1 ? parseInt(bookChapterParts[1]) : 1;
  
  // Normalize the input book name (removes accents, lowercase)
  const normalizedInput = normalizeText(spanishBookName);
  
  // Map normalized Spanish book names to API-compatible format
  // Keys are normalized (no accents, lowercase) for reliable matching
  const bookNameMapping: Record<string, string> = {
    'genesis': 'genesis',
    'exodo': 'exodo', 
    'levitico': 'levitico',
    'numeros': 'numeros',
    'deuteronomio': 'deuteronomio',
    'josue': 'josue',
    'jueces': 'jueces',
    'rut': 'rut',
    '1 samuel': '1samuel',
    '2 samuel': '2samuel',
    '1 reyes': '1reyes',
    '2 reyes': '2reyes',
    '1 cronicas': '1cronicas',
    '2 cronicas': '2cronicas',
    'esdras': 'esdras',
    'nehemias': 'nehemias',
    'ester': 'ester',
    'job': 'job',
    'salmos': 'salmos',
    'proverbios': 'proverbios',
    'eclesiastes': 'eclesiastes',
    'cantares': 'cantares',
    'isaias': 'isaias',
    'jeremias': 'jeremias',
    'lamentaciones': 'lamentaciones',
    'ezequiel': 'ezequiel',
    'daniel': 'daniel',
    'oseas': 'oseas',
    'joel': 'joel',
    'amos': 'amos',
    'abdias': 'abdias',
    'jonas': 'jonas',
    'miqueas': 'miqueas',
    'nahum': 'nahum',
    'habacuc': 'habacuc',
    'sofonias': 'sofonias',
    'hageo': 'hageo',
    'zacarias': 'zacarias',
    'malaquias': 'malaquias',
    'mateo': 'mateo',
    'marcos': 'marcos',
    'lucas': 'lucas',
    'juan': 'juan',
    'hechos': 'hechos',
    'romanos': 'romanos',
    '1 corintios': '1corintios',
    '2 corintios': '2corintios',
    'galatas': 'galatas',
    'efesios': 'efesios',
    'filipenses': 'filipenses',
    'colosenses': 'colosenses',
    '1 tesalonicenses': '1tesalonicenses',
    '2 tesalonicenses': '2tesalonicenses',
    '1 timoteo': '1timoteo',
    '2 timoteo': '2timoteo',
    'tito': 'tito',
    'filemon': 'filemon',
    'hebreos': 'hebreos',
    'santiago': 'santiago',
    '1 pedro': '1pedro',
    '2 pedro': '2pedro',
    '1 juan': '1juan',
    '2 juan': '2juan',
    '3 juan': '3juan',
    'judas': 'judas',
    'apocalipsis': 'apocalipsis'
  };
  
  // Get API-compatible book name using normalized lookup
  const book = bookNameMapping[normalizedInput] || normalizedInput;
  
  // Construct free RVR60 API URL (no key required)
  const apiUrl = `https://biblia-api.vercel.app/api/v1/${book.toLowerCase()}/${chapter}/${verse}`;

  console.log('Free Bible API Request:', {
    originalBook: spanishBookName,
    normalizedInput: normalizedInput,
    resolvedBook: book,
    chapter,
    verse,
    apiUrl,
    timestamp: new Date().toISOString()
  });

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'BibleApp/1.0 (Next.js App Router)'
      },
      signal: AbortSignal.timeout(15000), // 15 second timeout
    });

    console.log('Free Bible API Response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Free Bible API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText
      });

      return NextResponse.json(
        {
          error: `Free Bible API error: ${response.status} ${response.statusText}`,
          details: errorText,
          originalBook: spanishBookName,
          normalizedInput: normalizedInput,
          resolvedBook: book,
          chapter,
          verse,
          apiUrl
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // The free API returns JSON with verse text
    const result: BibleVerse = {
      reference: `${book} ${chapter}:${verse}`,
      text: data.text || data.cleanText || '',
      translation: 'RVR60',
      verse: verse,
      chapter: chapter,
      book: book
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Bible API Fetch Error:', error);

    // Handle different error types
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return NextResponse.json(
          {
            error: 'Request timeout. The Free Bible API is not responding.',
            details: 'Please try again in a few moments or check your internet connection.'
          },
          { status: 408 }
        );
      }
      
      if (error.name === 'TypeError') {
        return NextResponse.json(
          {
            error: 'Network error. Unable to connect to Free Bible API.',
            details: error.message
          },
          { status: 502 }
        );
      }
    }

    return NextResponse.json(
      {
        error: 'Failed to fetch Bible content from Free Bible API',
        details: error instanceof Error ? error.message : 'Unknown error',
        originalBook: spanishBookName,
        normalizedInput: normalizedInput,
        resolvedBook: book,
        chapter,
        verse,
        passage: cleanPassage
      },
      { status: 500 }
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
      { status: 400 }
    );
  }
}