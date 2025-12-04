import { CacheService } from './CacheService';

export interface TranslationResult {
  originalText: string;
  translatedText: string;
  fromLanguage: string;
  toLanguage: string;
  timestamp: string;
}

export class TranslationService {
  private mockTranslations: Record<string, string> = {
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

  async translateText(text: string, fromLang: string = 'es', toLang: string = 'en'): Promise<TranslationResult> {
    const cacheKey = `translation-${text}-${fromLang}-${toLang}`;
    const cached = this.cache.getCachedData(cacheKey);
    if (cached) return cached;

    // Simple mock translation - replace with real API later
    const translated = text.split(' ').map(word => {
      const cleanWord = word.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '');
      return this.mockTranslations[cleanWord] || word;
    }).join(' ');

    const result: TranslationResult = {
      originalText: text,
      translatedText: translated,
      fromLanguage: fromLang,
      toLanguage: toLang,
      timestamp: new Date().toISOString()
    };

    this.cache.setCachedData(cacheKey, result, 3600); // Cache for 1 hour
    return result;
  }

  async translateWord(word: string, fromLang: string = 'es', toLang: string = 'en'): Promise<string> {
    const cacheKey = `word-translation-${word}-${fromLang}-${toLang}`;
    const cached = this.cache.getCachedData(cacheKey);
    if (cached) return cached;

    const cleanWord = word.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '');
    const translation = this.mockTranslations[cleanWord] || word;

    this.cache.setCachedData(cacheKey, translation, 3600); // Cache for 1 hour
    return translation;
  }

  getSupportedLanguages(): string[] {
    return ['es', 'en']; // Spanish to English for now
  }
}