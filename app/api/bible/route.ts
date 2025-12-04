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
 * GET /api/bible?bible=RVR60&passage=Juan+3:16&format=html
 * Fetches Bible content from Biblia.com API with enhanced error handling
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const bibleId = searchParams.get('bible') || 'RVR60'; // Default to Reina-Valera 1960
  const passage = searchParams.get('passage');
  const format = searchParams.get('format') || 'html'; // 'html' or 'text'

  // Validate required parameters
  if (!passage) {
    return NextResponse.json(
      {
        error: 'Missing required parameter: passage is required',
        example: 'Juan 3:16 or Juan+3:16'
      },
      { status: 400 }
    );
  }

  const apiKey = process.env.BIBLIA_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json(
      {
        error: 'API key not configured. Please set BIBLIA_API_KEY in .env.local',
        envStatus: process.env.NODE_ENV || 'development'
      },
      { status: 500 }
    );
  }

  // Clean and format passage for API
  const cleanPassage = passage.replace(/\s+/g, '+');
  
  // Construct Biblia.com API URL
  const apiUrl = `https://api.biblia.com/v1/bible/content/${bibleId}.${format}?passage=${encodeURIComponent(cleanPassage)}&key=${apiKey}`;

  console.log('Biblia.com API Request:', {
    bibleId,
    passage: cleanPassage,
    format,
    apiUrl: apiUrl.replace(apiKey, '***HIDDEN***'), // Don't log actual key
    timestamp: new Date().toISOString()
  });

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': format === 'html' ? 'text/html' : 'text/plain',
        'Content-Type': 'application/json',
        'User-Agent': 'BibleApp/1.0 (Next.js App Router)'
      },
      signal: AbortSignal.timeout(15000), // 15 second timeout
    });

    console.log('Biblia.com API Response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Biblia.com API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText
      });

      return NextResponse.json(
        {
          error: `Biblia.com API error: ${response.status} ${response.statusText}`,
          details: errorText,
          bibleId: bibleId,
          passage: cleanPassage,
          apiUrl: apiUrl.replace(apiKey, '***HIDDEN***')
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
          'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
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
    console.error('Bible API Fetch Error:', error);

    // Handle different error types
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return NextResponse.json(
          {
            error: 'Request timeout. The Biblia.com API is not responding.',
            details: 'Please try again in a few moments or check your internet connection.'
          },
          { status: 408 }
        );
      }
      
      if (error.name === 'TypeError') {
        return NextResponse.json(
          {
            error: 'Network error. Unable to connect to Biblia.com API.',
            details: error.message
          },
          { status: 502 }
        );
      }
    }

    return NextResponse.json(
      {
        error: 'Failed to fetch Bible content from Biblia.com',
        details: error instanceof Error ? error.message : 'Unknown error',
        bibleId: bibleId,
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