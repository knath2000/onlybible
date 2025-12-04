import { CacheService } from './CacheService';

export interface TranslationResult {
  originalText: string;
  translatedText: string;
  fromLanguage: string;
  toLanguage: string;
  timestamp: string;
  source?: 'bible-api' | 'dictionary'; // Track where translation came from
}

export interface EnglishVerseResult {
  reference: string;
  text: string;
  translation: string;
  verse: number;
  chapter: number;
  book: string;
}

export class TranslationService {
  // Dictionary for word-by-word translations (used as fallback and for hover tooltips)
  private wordDictionary: Record<string, string> = {
    'principio': 'beginning',
    'cielos': 'heavens',
    'tierra': 'earth',
    'dios': 'God',
    'creó': 'created',
    'luz': 'light',
    'día': 'day',
    'noche': 'night',
    'mar': 'sea',
    'cielo': 'sky',
    'agua': 'water',
    'hizo': 'made',
    'bueno': 'good',
    'visto': 'seen',
    'que': 'that',
    'era': 'was',
    'sobre': 'over',
    'la': 'the',
    'y': 'and',
    'en': 'in',
    'de': 'of',
    'a': 'to',
    'con': 'with',
    'por': 'by',
    'para': 'for',
    'es': 'is',
    'son': 'are',
    'fue': 'was',
    'fueron': 'were',
    'había': 'there was',
    'habían': 'there were',
    'como': 'like',
    'así': 'so',
    'pero': 'but',
    'porque': 'because',
    'cuando': 'when',
    'donde': 'where',
    'quien': 'who',
    'este': 'this',
    'ese': 'that',
    'aquel': 'that',
    'mi': 'my',
    'tu': 'your',
    'su': 'his/her/its',
    'nuestro': 'our',
    'vuestro': 'your',
    'yo': 'I',
    'tú': 'you',
    'él': 'he',
    'ella': 'she',
    'nosotros': 'we',
    'vosotros': 'you all',
    'ellos': 'they',
    'ellas': 'they',
    'esto': 'this',
    'eso': 'that',
    'aquello': 'that',
    'aquí': 'here',
    'ahí': 'there',
    'allí': 'there',
    'sí': 'yes',
    'no': 'no',
    'tal vez': 'maybe',
    'quizás': 'perhaps',
    'siempre': 'always',
    'nunca': 'never',
    'a veces': 'sometimes',
    'mucho': 'much',
    'poco': 'little',
    'demasiado': 'too much',
    'bastante': 'enough',
    'todo': 'all',
    'algunos': 'some',
    'ninguno': 'none',
    'otro': 'other',
    'mismo': 'same',
    'diferente': 'different',
    'igual': 'equal',
    'mayor': 'greater',
    'menor': 'less',
    'mejor': 'better',
    'peor': 'worse',
    'primero': 'first',
    'último': 'last',
    'siguiente': 'next',
    'anterior': 'previous',
    'ahora': 'now',
    'antes': 'before',
    'después': 'after',
    'a menudo': 'often',
    'rara vez': 'rarely',
    'generalmente': 'usually',
    'normalmente': 'normally',
    'frecuentemente': 'frequently',
    'ocacionalmente': 'occasionally',
    'solo': 'only',
    'incluso': 'even',
    'también': 'also',
    'además': 'besides',
    'hasta': 'until',
    'aunque': 'although',
    'sin embargo': 'however',
    'no obstante': 'nevertheless',
    'por lo tanto': 'therefore',
    'así que': 'so',
    'entonces': 'then',
    'luego': 'later',
    'mientras': 'while',
    'qué': 'what',
    'quién': 'who',
    'cuál': 'which',
    'cuándo': 'when',
    'dónde': 'where',
    'por qué': 'why',
    'cómo': 'how',
    'cuánto': 'how much',
    'cuántos': 'how many'
  };

  private cache: CacheService;

  constructor(cache: CacheService) {
    this.cache = cache;
  }

  /**
   * Fetch the English translation of a Bible verse from KJV
   * This is the primary method for verse translations
   */
  async fetchEnglishVerse(spanishBook: string, chapter: number, verse: number): Promise<EnglishVerseResult> {
    const cacheKey = `english-verse-${spanishBook}-${chapter}-${verse}`;
    const cached = this.cache.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(
        `/api/bible/english?book=${encodeURIComponent(spanishBook)}&chapter=${chapter}&verse=${verse}`
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error: ${response.status}`);
      }

      const data: EnglishVerseResult = await response.json();
      
      // Cache for 24 hours (same as Spanish verses)
      this.cache.setCachedData(cacheKey, data, 86400);
      
      return data;
    } catch (error) {
      console.error('Error fetching English verse:', error);
      throw error;
    }
  }

  /**
   * Translate a verse by fetching the corresponding English Bible verse
   * Returns both the Spanish original and English translation
   */
  async translateVerse(
    spanishBook: string, 
    chapter: number, 
    verse: number, 
    spanishText: string
  ): Promise<TranslationResult> {
    const cacheKey = `verse-translation-${spanishBook}-${chapter}-${verse}`;
    const cached = this.cache.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      // Fetch the corresponding English verse from KJV
      const englishVerse = await this.fetchEnglishVerse(spanishBook, chapter, verse);

      const result: TranslationResult = {
        originalText: spanishText,
        translatedText: englishVerse.text,
        fromLanguage: 'es',
        toLanguage: 'en',
        timestamp: new Date().toISOString(),
        source: 'bible-api'
      };

      // Cache for 24 hours
      this.cache.setCachedData(cacheKey, result, 86400);
      return result;
    } catch (error) {
      console.error('Error translating verse:', error);
      
      // Fallback to dictionary-based translation if API fails
      return this.translateTextWithDictionary(spanishText);
    }
  }

  /**
   * Fallback: Dictionary-based text translation (word-by-word)
   * Used when the English Bible API is unavailable
   */
  async translateTextWithDictionary(text: string): Promise<TranslationResult> {
    const translated = text.split(' ').map(word => {
      const cleanWord = this.normalizeWord(word);
      return this.wordDictionary[cleanWord] || word;
    }).join(' ');

    return {
      originalText: text,
      translatedText: translated,
      fromLanguage: 'es',
      toLanguage: 'en',
      timestamp: new Date().toISOString(),
      source: 'dictionary'
    };
  }

  /**
   * Legacy method for backward compatibility
   * Now uses translateTextWithDictionary internally
   */
  async translateText(text: string, fromLang: string = 'es', toLang: string = 'en'): Promise<TranslationResult> {
    const cacheKey = `translation-${text}-${fromLang}-${toLang}`;
    const cached = this.cache.getCachedData(cacheKey);
    if (cached) return cached;

    const result = await this.translateTextWithDictionary(text);
    this.cache.setCachedData(cacheKey, result, 3600);
    return result;
  }

  /**
   * Translate a single word using the dictionary
   * Used for word-by-word hover tooltips
   */
  async translateWord(word: string, fromLang: string = 'es', toLang: string = 'en'): Promise<string> {
    const cacheKey = `word-translation-${word}-${fromLang}-${toLang}`;
    const cached = this.cache.getCachedData(cacheKey);
    if (cached) return cached;

    const cleanWord = this.normalizeWord(word);
    const translation = this.wordDictionary[cleanWord] || word;

    this.cache.setCachedData(cacheKey, translation, 3600);
    return translation;
  }

  /**
   * Normalize a word for dictionary lookup
   * Removes punctuation, accents, and converts to lowercase
   */
  private normalizeWord(word: string): string {
    return word
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()¿¡"'«»]/g, ''); // Remove punctuation
  }

  getSupportedLanguages(): string[] {
    return ['es', 'en'];
  }
}