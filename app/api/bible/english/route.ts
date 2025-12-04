import { NextRequest, NextResponse } from 'next/server';

interface EnglishBibleVerse {
  reference: string;
  text: string;
  translation: string;
  verse: number;
  chapter: number;
  book: string;
}

/**
 * Normalize text by removing accents/diacritics and converting to lowercase
 */
function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
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
  
  if (!spanishBook || !chapter || !verse) {
    return NextResponse.json(
      {
        error: 'Missing required parameters: book, chapter, and verse are required',
        example: '/api/bible/english?book=Génesis&chapter=1&verse=1'
      },
      { status: 400 }
    );
  }

  // Normalize the Spanish book name for lookup
  const normalizedInput = normalizeText(spanishBook);
  
  // Map Spanish book names (normalized) to English book names for bible-api.com
  const spanishToEnglishBooks: Record<string, string> = {
    // Old Testament
    'genesis': 'Genesis',
    'exodo': 'Exodus',
    'levitico': 'Leviticus',
    'numeros': 'Numbers',
    'deuteronomio': 'Deuteronomy',
    'josue': 'Joshua',
    'jueces': 'Judges',
    'rut': 'Ruth',
    '1 samuel': '1 Samuel',
    '2 samuel': '2 Samuel',
    '1 reyes': '1 Kings',
    '2 reyes': '2 Kings',
    '1 cronicas': '1 Chronicles',
    '2 cronicas': '2 Chronicles',
    'esdras': 'Ezra',
    'nehemias': 'Nehemiah',
    'ester': 'Esther',
    'job': 'Job',
    'salmos': 'Psalms',
    'proverbios': 'Proverbs',
    'eclesiastes': 'Ecclesiastes',
    'cantares': 'Song of Solomon',
    'isaias': 'Isaiah',
    'jeremias': 'Jeremiah',
    'lamentaciones': 'Lamentations',
    'ezequiel': 'Ezekiel',
    'daniel': 'Daniel',
    'oseas': 'Hosea',
    'joel': 'Joel',
    'amos': 'Amos',
    'abdias': 'Obadiah',
    'jonas': 'Jonah',
    'miqueas': 'Micah',
    'nahum': 'Nahum',
    'habacuc': 'Habakkuk',
    'sofonias': 'Zephaniah',
    'hageo': 'Haggai',
    'zacarias': 'Zechariah',
    'malaquias': 'Malachi',
    // New Testament
    'mateo': 'Matthew',
    'marcos': 'Mark',
    'lucas': 'Luke',
    'juan': 'John',
    'hechos': 'Acts',
    'romanos': 'Romans',
    '1 corintios': '1 Corinthians',
    '2 corintios': '2 Corinthians',
    'galatas': 'Galatians',
    'efesios': 'Ephesians',
    'filipenses': 'Philippians',
    'colosenses': 'Colossians',
    '1 tesalonicenses': '1 Thessalonians',
    '2 tesalonicenses': '2 Thessalonians',
    '1 timoteo': '1 Timothy',
    '2 timoteo': '2 Timothy',
    'tito': 'Titus',
    'filemon': 'Philemon',
    'hebreos': 'Hebrews',
    'santiago': 'James',
    '1 pedro': '1 Peter',
    '2 pedro': '2 Peter',
    '1 juan': '1 John',
    '2 juan': '2 John',
    '3 juan': '3 John',
    'judas': 'Jude',
    'apocalipsis': 'Revelation'
  };
  
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
  
  // Construct bible-api.com URL (free, no API key required)
  // Format: https://bible-api.com/john+3:16?translation=kjv
  const passage = `${englishBook}+${chapter}:${verse}`;
  const apiUrl = `https://bible-api.com/${encodeURIComponent(passage)}?translation=kjv`;

  console.log('English Bible API Request:', {
    spanishBook,
    normalizedInput,
    englishBook,
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
        'User-Agent': 'BibleApp/1.0 (Next.js App Router)'
      },
      signal: AbortSignal.timeout(15000), // 15 second timeout
    });

    console.log('English Bible API Response:', {
      status: response.status,
      statusText: response.statusText
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('English Bible API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText
      });

      return NextResponse.json(
        {
          error: `English Bible API error: ${response.status} ${response.statusText}`,
          details: errorText,
          englishBook,
          chapter,
          verse
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // bible-api.com returns: { reference, verses: [{ book_id, book_name, chapter, verse, text }], text, translation_id, translation_name, translation_note }
    const result: EnglishBibleVerse = {
      reference: data.reference || `${englishBook} ${chapter}:${verse}`,
      text: data.text?.trim() || '',
      translation: data.translation_name || 'KJV',
      verse: parseInt(verse),
      chapter: parseInt(chapter),
      book: englishBook
    };

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, max-age=86400' // Cache for 24 hours
      }
    });
  } catch (error) {
    console.error('English Bible API Fetch Error:', error);

    // Handle different error types
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return NextResponse.json(
          {
            error: 'Request timeout. The English Bible API is not responding.',
            details: 'Please try again in a few moments.'
          },
          { status: 408 }
        );
      }
      
      if (error.name === 'TypeError') {
        return NextResponse.json(
          {
            error: 'Network error. Unable to connect to English Bible API.',
            details: error.message
          },
          { status: 502 }
        );
      }
    }

    return NextResponse.json(
      {
        error: 'Failed to fetch English Bible content',
        details: error instanceof Error ? error.message : 'Unknown error',
        englishBook,
        chapter,
        verse
      },
      { status: 500 }
    );
  }
}
