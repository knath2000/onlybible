import { CacheService } from './CacheService';
import { mockBibleData, mockBooks, mockChapters, mockChapterVerses } from './mockBibleData';

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
  private apiUrl = 'https://biblia-api.vercel.app/api/v1';
  private cache: CacheService;
  private useMockData: boolean = false; // Set to false to use API routes for CORS resolution

  constructor(cache: CacheService) {
    this.cache = cache;
  }

  async fetchVerse(book: string, chapter: number, verse: number): Promise<BibleVerse> {
    const cacheKey = `verse-${book}-${chapter}-${verse}`;
    const cached = this.cache.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      if (this.useMockData) {
        // Use mock data for development (avoids CORS issues)
        const mockBookKey = book.toLowerCase();
        const chapterData = mockBibleData[mockBookKey]?.[chapter];
        const verseText = chapterData?.[verse] || 'Versículo no encontrado';

        const result = {
          reference: `${book} ${chapter}:${verse}`,
          text: verseText,
          translation: 'rvr60',
          verse: verse,
          chapter: chapter,
          book: book
        };

        this.cache.setCachedData(cacheKey, result, 86400);
        return result;
      } else {
        // Use Next.js API route to avoid CORS issues
        const response = await fetch(`/api/bible?book=${encodeURIComponent(book)}&chapter=${chapter}&verse=${verse}`);
        
        const data = await response.json();
        
        // If API route returns error, fallback to mock data
        if (data.error) {
          throw new Error(data.error);
        }
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = {
          reference: `${book} ${chapter}:${verse}`,
          text: data.text || 'Versículo no encontrado',
          translation: 'rvr60',
          verse: verse,
          chapter: chapter,
          book: book
        };

        this.cache.setCachedData(cacheKey, result, 86400);
        return result;
      }
    } catch (error) {
      console.error('Error fetching verse:', error);

      // Fallback to mock data if API fails
      const mockBookKey = book.toLowerCase();
      const chapterData = mockBibleData[mockBookKey]?.[chapter];
      const verseText = chapterData?.[verse] || 'Versículo no encontrado';

      return {
        reference: `${book} ${chapter}:${verse}`,
        text: verseText,
        translation: 'rvr60',
        verse: verse,
        chapter: chapter,
        book: book
      };
    }
  }

  async fetchChapter(book: string, chapter: number): Promise<BibleChapter> {
    const cacheKey = `chapter-${book}-${chapter}`;
    const cached = this.cache.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      if (this.useMockData) {
        // Use mock data for development
        const mockBookKey = book.toLowerCase();
        const chapterData = mockBibleData[mockBookKey]?.[chapter] || {};

        const verses = Object.entries(chapterData).map(([verseNum, text]) => ({
          reference: `${book} ${chapter}:${verseNum}`,
          text: text as string,
          translation: 'rvr60',
          verse: parseInt(verseNum),
          chapter: chapter,
          book: book
        }));

        const result = {
          reference: `${book} ${chapter}`,
          verses: verses,
          chapter: chapter,
          book: book,
          translation: 'rvr60'
        };

        this.cache.setCachedData(cacheKey, result, 86400);
        return result;
      } else {
        // Use Next.js API route to avoid CORS issues
        const response = await fetch(`/api/bible?book=${encodeURIComponent(book)}&chapter=${chapter}`);
        
        const data = await response.json();
        
        // If API route returns error, fallback to mock data
        if (data.error) {
          throw new Error(data.error);
        }
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = {
          reference: `${book} ${chapter}`,
          verses: Array.isArray(data.verses) ? data.verses : [],
          chapter: chapter,
          book: book,
          translation: 'rvr60'
        };

        this.cache.setCachedData(cacheKey, result, 86400);
        return result;
      }
    } catch (error) {
      console.error('Error fetching chapter:', error);

      // Fallback to mock data if API fails
      const mockBookKey = book.toLowerCase();
      const chapterData = mockBibleData[mockBookKey]?.[chapter] || {};

      const verses = Object.entries(chapterData).map(([verseNum, text]) => ({
        reference: `${book} ${chapter}:${verseNum}`,
        text: text as string,
        translation: 'rvr60',
        verse: parseInt(verseNum),
        chapter: chapter,
        book: book
      }));

      return {
        reference: `${book} ${chapter}`,
        verses: verses,
        chapter: chapter,
        book: book,
        translation: 'rvr60'
      };
    }
  }

  async getAvailableBooks(): Promise<string[]> {
    if (this.useMockData) {
      return mockBooks;
    } else {
      // In production, this would come from API or be hardcoded
      return mockBooks;
    }
  }

  async getChaptersInBook(book: string): Promise<number> {
    if (this.useMockData) {
      return mockChapters[book] || 30;
    } else {
      // In production, this would come from API or be hardcoded
      return mockChapters[book] || 30;
    }
  }

  async getVersesInChapter(book: string, chapter: number): Promise<number> {
    if (this.useMockData) {
      return mockChapterVerses[book]?.[chapter] || 30;
    } else {
      // In production, this would come from API or be hardcoded
      return mockChapterVerses[book]?.[chapter] || 30;
    }
  }

  // Method to switch between mock and real API
  setUseMockData(useMock: boolean): void {
    this.useMockData = useMock;
  }
}