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
  private apiUrl = 'https://api.biblia.com/v1';
  private cache: CacheService;
  private useMockData: boolean = false; // Set to false to use ONLY Biblia.com API

  constructor(cache: CacheService) {
    this.cache = cache;
  }

  async fetchVerse(book: string, chapter: number, verse: number): Promise<BibleVerse> {
    const cacheKey = `verse-${book}-${chapter}-${verse}`;
    const cached = this.cache.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      // Use ONLY Biblia.com API
      const passage = `${book}+${chapter}:${verse}`;
      const response = await fetch(`/api/bible?bible=RVR60&passage=${encodeURIComponent(passage)}&format=text`);
      
      const data = await response.json();
      
      // If API route returns error, throw error
      if (data.error) {
        throw new Error(data.error);
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = {
        reference: `${book} ${chapter}:${verse}`,
        text: data.text || 'Versículo no encontrado',
        translation: data.translation || 'RVR60',
        verse: verse,
        chapter: chapter,
        book: book
      };

      this.cache.setCachedData(cacheKey, result, 86400);
      return result;
    } catch (error) {
      console.error('Error fetching verse from Biblia.com:', error);
      throw error; // Re-throw error to be handled by calling component
    }
  }

  async fetchChapter(book: string, chapter: number): Promise<BibleChapter> {
    const cacheKey = `chapter-${book}-${chapter}`;
    const cached = this.cache.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      // For Biblia.com API, fetch the first verse as a sample
      // In a real implementation, you might want to fetch multiple verses
      // or use a different API that supports chapter fetching
      const passage = `${book}+${chapter}:1`;
      const response = await fetch(`/api/bible?bible=RVR60&passage=${encodeURIComponent(passage)}&format=text`);
      
      const data = await response.json();
      
      // If API route returns error, throw error
      if (data.error) {
        throw new Error(data.error);
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Create a single verse result for the chapter
      const verses = [{
        reference: `${book} ${chapter}:1`,
        text: data.text || 'Versículo no encontrado',
        translation: data.translation || 'RVR60',
        verse: 1,
        chapter: chapter,
        book: book
      }];

      const result = {
        reference: `${book} ${chapter}`,
        verses: verses,
        chapter: chapter,
        book: book,
        translation: data.translation || 'RVR60'
      };

      this.cache.setCachedData(cacheKey, result, 86400);
      return result;
    } catch (error) {
      console.error('Error fetching chapter from Biblia.com:', error);
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
    // Return verse counts for key chapters (sample data)
    // In a real implementation, this would come from the API
    const verseCounts: Record<string, Record<number, number>> = {
      'Génesis': {
        1: 31, 2: 25, 3: 24, 4: 26, 5: 32, 6: 22, 7: 24, 8: 22, 9: 29, 10: 32,
        11: 32, 12: 20, 13: 18, 14: 24, 15: 21, 16: 16, 17: 27, 18: 33, 19: 38, 20: 18,
        21: 34, 22: 24, 23: 20, 24: 67, 25: 34, 26: 35, 27: 46, 28: 22, 29: 35, 30: 43,
        31: 55, 32: 32, 33: 20, 34: 31, 35: 29, 36: 43, 37: 36, 38: 30, 39: 23, 40: 23,
        41: 57, 42: 38, 43: 34, 44: 34, 45: 28, 46: 34, 47: 31, 48: 22, 49: 33, 50: 26
      },
      'Juan': {
        1: 51, 2: 25, 3: 36, 4: 54, 5: 47, 6: 71, 7: 53, 8: 59, 9: 41, 10: 42,
        11: 57, 12: 50, 13: 38, 14: 31, 15: 27, 16: 33, 17: 26, 18: 40, 19: 42, 20: 31, 21: 25
      },
      'Salmos': {
        1: 6, 2: 12, 3: 8, 4: 8, 5: 12, 6: 10, 7: 17, 8: 9, 9: 20, 10: 18,
        11: 7, 12: 8, 13: 6, 14: 7, 15: 5, 16: 11, 17: 15, 18: 50, 19: 14, 20: 9,
        21: 13, 22: 31, 23: 6, 24: 10, 25: 22, 26: 12, 27: 14, 28: 9, 29: 11, 30: 12,
        31: 24, 32: 11, 33: 22, 34: 23, 35: 28, 36: 12, 37: 40, 38: 22, 39: 13, 40: 17,
        41: 13, 42: 11, 43: 5, 44: 26, 45: 24, 46: 11, 47: 9, 48: 14, 49: 9, 50: 23,
        51: 19, 52: 9, 53: 6, 54: 7, 55: 23, 56: 12, 57: 11, 58: 11, 59: 17, 60: 12,
        61: 8, 62: 12, 63: 11, 64: 10, 65: 13, 66: 20, 67: 35, 68: 35, 69: 36, 70: 5,
        71: 24, 72: 20, 73: 28, 74: 23, 75: 10, 76: 12, 77: 28, 78: 72, 79: 13, 80: 19,
        81: 16, 82: 8, 83: 18, 84: 12, 85: 13, 86: 17, 87: 7, 88: 18, 89: 52, 90: 17,
        91: 16, 92: 15, 93: 5, 94: 23, 95: 11, 96: 13, 97: 12, 98: 9, 99: 9, 100: 5,
        101: 8, 102: 28, 103: 22, 104: 35, 105: 45, 106: 48, 107: 43, 108: 13, 109: 31, 110: 5,
        111: 10, 112: 10, 113: 9, 114: 8, 115: 18, 116: 19, 117: 2, 118: 176, 119: 176, 120: 5,
        121: 8, 122: 5, 123: 4, 124: 8, 125: 5, 126: 5, 127: 5, 128: 6, 129: 5, 130: 8,
        131: 8, 132: 10, 133: 3, 134: 3, 135: 21, 136: 24, 137: 9, 138: 8, 139: 24, 140: 13,
        141: 10, 142: 7, 143: 12, 144: 15, 145: 7, 146: 10, 147: 11, 148: 14, 149: 9, 150: 6
      }
    };
    
    return verseCounts[book]?.[chapter] || 30;
  }

  // Method to switch between mock and real API
  setUseMockData(useMock: boolean): void {
    this.useMockData = useMock;
  }
}