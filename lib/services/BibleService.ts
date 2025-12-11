import { CacheService } from './CacheService';

export interface BibleVerse {
  reference: string;
  text: string;
  translation: string;
  verse: number;
  chapter: number;
  book: string;
}

export interface BibleChapter {
  reference: string;
  verses: BibleVerse[];
  chapter: number;
  book: string;
  translation: string;
}

export class BibleService {
  private cache: CacheService;
  // Use relative path so production and preview resolve to the current origin (avoids mixed-content/CORS)
  private apiUrl = '/api/bible';
  private useMockData: boolean = false; // Set to false to use ONLY Biblia.com API

  constructor(cache: CacheService) {
    this.cache = cache;
  }

  async fetchVerse(book: string, chapter: number, verse: number): Promise<BibleVerse> {
    const cacheKey = `verse-${book}-${chapter}-${verse}`;
    const cached = this.cache.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      // Call our proxy with explicit book/chapter/verse to avoid "passage" mismatch
      const url = `${this.apiUrl}?book=${encodeURIComponent(book)}&chapter=${chapter}&verse=${verse}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const verseData = data.verses?.[0];

      if (!verseData) {
        throw new Error('No verse data returned from API');
      }

      const result: BibleVerse = {
        reference: `${book} ${chapter}:${verse}`,
        text: verseData.text || verseData.content || 'Versículo no encontrado',
        translation: verseData.translation || data.translation || 'RVR60',
        verse: verseData.verse ?? verse,
        chapter: chapter,
        book: book
      };

      this.cache.setCachedData(cacheKey, result, 86400);
      return result;
    } catch (error) {
      console.error('Error fetching verse from Free Bible API:', error);
      
      // Provide more specific error messages
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Unable to connect to Bible API. Please check your internet connection and try again.');
      }
      
      if (error instanceof Error && error.message.includes('HTTP error')) {
        throw new Error(`Bible API returned an error (${error.message}). Please verify the verse reference and try again.`);
      }
      
      throw error; // Re-throw error to be handled by calling component
    }
  }

  async fetchChapter(book: string, chapter: number): Promise<BibleChapter> {
    const cacheKey = `chapter-${book}-${chapter}`;
    const cached = this.cache.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      // Fetch a sample (first verse) using the same structured endpoint
      const url = `${this.apiUrl}?book=${encodeURIComponent(book)}&chapter=${chapter}&verse=1`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const verseData = data.verses?.[0];

      const verses = [{
        reference: `${book} ${chapter}:1`,
        text: verseData?.text || verseData?.content || 'Versículo no encontrado',
        translation: verseData?.translation || data.translation || 'RVR60',
        verse: 1,
        chapter: chapter,
        book: book
      }];

      const result: BibleChapter = {
        reference: `${book} ${chapter}`,
        verses: verses,
        chapter: chapter,
        book: book,
        translation: verseData?.translation || data.translation || 'RVR60'
      };

      this.cache.setCachedData(cacheKey, result, 86400);
      return result;
    } catch (error) {
      console.error('Error fetching chapter from Free Bible API:', error);
      
      // Provide more specific error messages
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Unable to connect to Bible API. Please check your internet connection and try again.');
      }
      
      if (error instanceof Error && error.message.includes('HTTP error')) {
        throw new Error(`Bible API returned an error (${error.message}). Please verify the chapter reference and try again.`);
      }
      
      throw error; // Re-throw error to be handled by calling component
    }
  }

  async getAvailableBooks(): Promise<string[]> {
    // Return the 66 books of the Bible (Reina-Valera 1960)
    return [
      'Génesis', 'Éxodo', 'Levítico', 'Números', 'Deuteronomio',
      'Josué', 'Jueces', 'Rut', '1 Samuel', '2 Samuel',
      '1 Reyes', '2 Reyes', '1 Crónicas', '2 Crónicas', 'Esdras',
      'Nehemías', 'Ester', 'Job', 'Salmos', 'Proverbios',
      'Eclesiastés', 'Cantares', 'Isaías', 'Jeremías', 'Lamentaciones',
      'Ezequiel', 'Daniel', 'Oseas', 'Joel', 'Amós',
      'Abdías', 'Jonás', 'Miqueas', 'Nahúm', 'Habacuc',
      'Sofonías', 'Hageo', 'Zacarías', 'Malaquías', 'Mateo',
      'Marcos', 'Lucas', 'Juan', 'Hechos', 'Romanos',
      '1 Corintios', '2 Corintios', 'Gálatas', 'Efesios', 'Filipenses',
      'Colosenses', '1 Tesalonicenses', '2 Tesalonicenses', '1 Timoteo', '2 Timoteo',
      'Tito', 'Filemón', 'Hebreos', 'Santiago', '1 Pedro',
      '2 Pedro', '1 Juan', '2 Juan', '3 Juan', 'Judas',
      'Apocalipsis'
    ];
  }

  async getChaptersInBook(book: string): Promise<number> {
    // Return chapter counts for each book
    const chapterCounts: Record<string, number> = {
      'Génesis': 50, 'Éxodo': 40, 'Levítico': 27, 'Números': 36, 'Deuteronomio': 34,
      'Josué': 24, 'Jueces': 21, 'Rut': 4, '1 Samuel': 31, '2 Samuel': 24,
      '1 Reyes': 22, '2 Reyes': 25, '1 Crónicas': 29, '2 Crónicas': 36, 'Esdras': 10,
      'Nehemías': 13, 'Ester': 10, 'Job': 42, 'Salmos': 150, 'Proverbios': 31,
      'Eclesiastés': 12, 'Cantares': 8, 'Isaías': 66, 'Jeremías': 52, 'Lamentaciones': 5,
      'Ezequiel': 48, 'Daniel': 12, 'Oseas': 14, 'Joel': 3, 'Amós': 9,
      'Abdías': 1, 'Jonás': 4, 'Miqueas': 7, 'Nahúm': 3, 'Habacuc': 3,
      'Sofonías': 3, 'Hageo': 2, 'Zacarías': 14, 'Malaquías': 4, 'Mateo': 28,
      'Marcos': 16, 'Lucas': 24, 'Juan': 21, 'Hechos': 28, 'Romanos': 16,
      '1 Corintios': 16, '2 Corintios': 13, 'Gálatas': 6, 'Efesios': 6, 'Filipenses': 4,
      'Colosenses': 4, '1 Tesalonicenses': 5, '2 Tesalonicenses': 3, '1 Timoteo': 6, '2 Timoteo': 4,
      'Tito': 3, 'Filemón': 1, 'Hebreos': 13, 'Santiago': 5, '1 Pedro': 5,
      '2 Pedro': 3, '1 Juan': 5, '2 Juan': 1, '3 Juan': 1, 'Judas': 1,
      'Apocalipsis': 22
    };
    
    return chapterCounts[book] || 30;
  }

  async getVersesInChapter(book: string, chapter: number): Promise<number> {
    const cacheKey = `chapter-verses-${book}-${chapter}`;
    const cached = this.cache.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      // Use the new meta endpoint to get authoritative verse count
      const response = await fetch(`/api/bible?book=${encodeURIComponent(book)}&chapter=${chapter}&meta=1`);

      if (!response.ok) {
        console.warn(`Failed to fetch chapter metadata for ${book} ${chapter}, falling back to estimate`);
        return 30; // Fallback to a reasonable default
      }

      const data = await response.json();
      const verseCount = data.chapterVerseCount;

      if (typeof verseCount !== 'number' || verseCount <= 0) {
        console.warn(`Invalid verse count for ${book} ${chapter}: ${verseCount}`);
        return 30; // Fallback to a reasonable default
      }

      // Cache for 24 hours (same as other verse data)
      this.cache.setCachedData(cacheKey, verseCount, 86400);
      return verseCount;
    } catch (error) {
      console.error('Error fetching chapter verse count:', error);
      return 30; // Fallback to a reasonable default
    }
  }

  async fetchVerseRange(
    book: string,
    chapter: number,
    startVerse: number,
    endVerse: number
  ): Promise<BibleVerse[]> {
    const cacheKey = `verse-range-${book.toLowerCase()}-${chapter}-${startVerse}-${endVerse}`;
    const cached = this.cache.getCachedData(cacheKey);
    if (cached) return cached as BibleVerse[];

    try {
      const url = `${this.apiUrl}?book=${encodeURIComponent(book)}&chapter=${chapter}&startVerse=${startVerse}&endVerse=${endVerse}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Range fetch failed: ${response.status}`);

      const data = await response.json();

      // Server now handles clamping and returns proper verse objects
      const verses: BibleVerse[] = data.verses.map((v: any) => ({
        book,
        chapter,
        verse: v.verse, // Use verse number from server response
        text: v.text || 'Verse not available',
        reference: data.reference,
        translation: 'RVR60'
      }));

      // Cache for 24h
      this.cache.setCachedData(cacheKey, verses, 86400);
      return verses;
    } catch (error) {
      console.error('Verse range error:', error);
      // Fallback: Fetch singles sequentially if batch fails (for robustness)
      // Note: This fallback doesn't clamp, but that's ok since it's rare
      const fallbackPromises = [];
      for (let v = startVerse; v <= endVerse; v++) {
        fallbackPromises.push(
          this.fetchVerse(book, chapter, v).catch(
            () =>
              ({
                book,
                chapter,
                verse: v,
                text: 'Loading...',
                reference: ''
              } as BibleVerse)
          )
        );
      }
      const fallbackVerses = await Promise.all(fallbackPromises);
      this.cache.setCachedData(cacheKey, fallbackVerses, 3600); // Shorter cache on fallback
      return fallbackVerses;
    }
  }

  // Method to switch between mock and real API
  setUseMockData(useMock: boolean): void {
    this.useMockData = useMock;
  }

  /**
   * Test API connectivity with a simple verse
   * Returns diagnostic information about the API connection
   */
  async testConnection(): Promise<{
    success: boolean;
    message: string;
    details?: any;
  }> {
    try {
      console.log('Testing Bible API connection...');
      
      // Test with John 3:16 (commonly used test verse)
      const testVerse = await this.fetchVerse('Juan', 3, 16);
      
      if (testVerse && testVerse.text && testVerse.text.length > 0) {
        console.log('Bible API connection test successful:', testVerse);
        return {
          success: true,
          message: 'Bible API connection successful',
          details: {
            reference: testVerse.reference,
            textLength: testVerse.text.length,
            translation: testVerse.translation
          }
        };
      } else {
        throw new Error('Received empty or invalid response from API');
      }
    } catch (error) {
      console.error('Bible API connection test failed:', error);
      
      let errorMessage = 'Unknown error';
      let errorDetails = {};
      
      if (error instanceof Error) {
        errorMessage = error.message;
        errorDetails = {
          name: error.name,
          stack: error.stack
        };
      }
      
      // Provide specific guidance based on error type
      let userMessage = errorMessage;
      if (errorMessage.includes('Unable to connect')) {
        userMessage = 'Cannot connect to Bible API. Please check your internet connection.';
      } else if (errorMessage.includes('HTTP error')) {
        userMessage = 'Bible API returned an error. The service may be temporarily unavailable.';
      } else if (errorMessage.includes('API key')) {
        userMessage = 'API key configuration issue. Please check environment variables.';
      }
      
      return {
        success: false,
        message: userMessage,
        details: {
          error: errorMessage,
          technicalDetails: errorDetails,
          timestamp: new Date().toISOString()
        }
      };
    }
  }
}