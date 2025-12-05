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
  // Expanded Dictionary for word-by-word translations
  private wordDictionary: Record<string, string | string[]> = {
    // Common Particles & Prepositions
    'y': 'and',
    'o': 'or',
    'pero': 'but',
    'mas': 'but',
    'sino': 'but',
    'porque': ['because', 'for'],
    'pues': ['for', 'then'],
    'que': ['that', 'which', 'who'],
    'en': ['in', 'on', 'at'],
    'de': ['of', 'from'],
    'a': 'to',
    'con': 'with',
    'sin': 'without',
    'por': ['by', 'for', 'through'],
    'para': ['for', 'to'],
    'sobre': ['over', 'upon', 'about'],
    'entre': ['between', 'among'],
    'hacia': 'towards',
    'desde': 'from',
    'hasta': ['until', 'unto'],
    'durante': 'during',
    'según': 'according to',
    'contra': 'against',
    
    // Articles & Pronouns
    'el': ['the', 'he'],
    'la': 'the',
    'los': ['the', 'them'],
    'las': ['the', 'them'],
    'un': ['a', 'an', 'one'],
    'una': ['a', 'an', 'one'],
    'unos': 'some',
    'unas': 'some',
    'este': 'this',
    'esta': 'this',
    'esto': 'this',
    'ese': 'that',
    'esa': 'that',
    'eso': 'that',
    'aquel': 'that',
    'aquella': 'that',
    'aquello': 'that',
    'mi': 'my',
    'tu': 'your',
    'su': ['his', 'her', 'its', 'their'],
    'nuestro': 'our',
    'vuestro': 'your',
    'yo': 'I',
    'tú': 'you',
    'él': 'he',
    'ella': 'she',
    'usted': 'you',
    'nosotros': 'we',
    'vosotros': 'you',
    'ellos': 'they',
    'ellas': 'they',
    'ustedes': 'you',
    'quien': 'who',
    'quienes': 'who',
    'donde': 'where',
    'cuando': 'when',
    'como': ['like', 'as', 'how'],
    'todo': ['all', 'every', 'whole'],
    'toda': ['all', 'every', 'whole'],
    'todos': ['all', 'everyone'],
    'todas': 'all',
    'nada': 'nothing',
    'nadie': 'no one',
    'algo': 'something',
    'alguien': 'someone',
    'mismo': ['same', 'self'],
    'propio': 'own',

    // Common Verbs (Infinitive & Conjugated forms)
    'ser': 'be',
    'es': 'is',
    'son': 'are',
    'soy': 'am',
    'eres': 'are',
    'era': 'was',
    'eran': 'were',
    'sea': 'be',
    'sido': 'been',
    'estar': 'be',
    'está': 'is',
    'están': 'are',
    'estaba': 'was',
    'estaban': 'were',
    'estuvo': 'was',
    'haber': 'have',
    'ha': 'has',
    'han': 'have',
    'había': 'had',
    'hay': ['there is', 'there are'],
    'hacer': ['make', 'do'],
    'hizo': ['made', 'did'],
    'hace': ['makes', 'does'],
    'hecho': ['made', 'done'],
    'decir': 'say',
    'dijo': 'said',
    'dice': 'says',
    'dicho': 'said',
    'ir': 'go',
    'va': 'goes',
    'fue': ['was', 'went'],
    'fueron': ['were', 'went'],
    'ver': 'see',
    'vio': 'saw',
    'visto': 'seen',
    've': 'sees',
    'dar': 'give',
    'dio': 'gave',
    'dado': 'given',
    'da': 'gives',
    'saber': 'know',
    'sabe': 'knows',
    'supo': 'knew',
    'querer': 'want',
    'quiere': 'wants',
    'quiso': 'wanted',
    'llegar': 'arrive',
    'llegó': 'arrived',
    'pasar': 'pass',
    'pasó': 'passed',
    'deber': ['must', 'ought', 'owe'],
    'debe': 'must',
    'poner': 'put',
    'puso': 'put',
    'parecer': 'seem',
    'parece': 'seems',
    'quedar': ['stay', 'remain'],
    'creer': 'believe',
    'cree': 'believes',
    'creyó': 'believed',
    'hablar': 'speak',
    'habló': 'spoke',
    'llevar': ['carry', 'take', 'bear'],
    'llevó': ['carried', 'took'],
    'dejar': ['leave', 'let'],
    'dejó': ['left', 'let'],
    'seguir': 'follow',
    'siguió': 'followed',
    'encontrar': 'find',
    'encontró': 'found',
    'llamar': 'call',
    'llamó': 'called',
    'venir': 'come',
    'vino': 'came',
    'vienen': 'come',
    'pensar': 'think',
    'piensa': 'thinks',
    'salir': ['go out', 'leave'],
    'salió': ['went out', 'left'],
    'volver': 'return',
    'volvió': 'returned',
    'tomar': 'take',
    'tomó': 'took',
    'conocer': 'know',
    'conoció': 'knew',
    'vivir': 'live',
    'vivió': 'lived',
    'sentir': 'feel',
    'sintió': 'felt',
    'tratar': 'try',
    'mirar': 'look',
    'miró': 'looked',
    'contar': ['count', 'tell'],
    'empezar': 'start',
    'comenzar': 'begin',
    'esperar': ['wait', 'hope'],
    'buscar': 'seek',
    'existir': 'exist',
    'entrar': 'enter',
    'entró': 'entered',
    'escribir': 'write',
    'escribió': 'wrote',
    'escrito': 'written',
    'perder': 'lose',
    'amar': 'love',
    'amó': 'loved',
    'ama': 'loves',
    'odiar': 'hate',
    'temer': 'fear',
    'orar': 'pray',
    'crear': 'create',
    'creó': 'created',
    'engendrar': 'beget',
    'engendró': 'begat',

    // Biblical Nouns
    'dios': ['God', 'Deity'],
    'señor': 'Lord',
    'jesús': 'Jesus',
    'cristo': 'Christ',
    'espíritu': 'Spirit',
    'santo': ['holy', 'Holy', 'saint', 'Saint'],
    'padre': 'Father',
    'hijo': 'Son',
    'hombre': 'man',
    'mujer': 'woman',
    'niño': 'child',
    'pueblo': 'people',
    'gente': 'people',
    'mundo': 'world',
    'vida': 'life',
    'muerte': 'death',
    'amor': 'love',
    'corazón': 'heart',
    'alma': 'soul',
    'mente': 'mind',
    'cuerpo': 'body',
    'carne': 'flesh',
    'sangre': 'blood',
    'luz': 'light',
    'tinieblas': 'darkness',
    'oscuridad': 'darkness',
    'día': 'day',
    'noche': 'night',
    'cielo': ['heaven', 'sky'],
    'cielos': ['heavens', 'skies'],
    'tierra': ['earth', 'land'],
    'mar': 'sea',
    'agua': 'water',
    'fuego': 'fire',
    'viento': 'wind',
    'camino': 'way',
    'verdad': 'truth',
    'palabra': 'word',
    'verbo': 'Word',
    'ley': 'law',
    'gracia': 'grace',
    'fe': 'faith',
    'esperanza': 'hope',
    'paz': 'peace',
    'gloria': 'glory',
    'reino': 'kingdom',
    'rey': 'king',
    'profeta': 'prophet',
    'sacerdote': 'priest',
    'templo': 'temple',
    'casa': 'house',
    'iglesia': 'church',
    'evangelio': 'gospel',
    'pecado': 'sin',
    'mal': 'evil',
    'bien': 'good',
    'justicia': ['righteousness', 'justice'],
    'misericordia': 'mercy',
    'sabiduría': 'wisdom',
    'nombre': 'name',
    'voz': 'voice',
    'mano': 'hand',
    'ojo': 'eye',
    'cara': 'face',
    'rostro': 'face',
    'boca': 'mouth',
    'pie': 'foot',
    'cabeza': 'head',
    'principio': 'beginning',
    'fin': 'end',
    'siglo': ['age', 'century', 'forever'],
    'tiempo': 'time',
    'hora': 'hour',
    'año': 'year',
    'mes': 'month',
    'semana': 'week',
    'mañana': 'morning',
    'tarde': ['afternoon', 'late'],
    'hermano': 'brother',
    'hermana': 'sister',
    'amigo': 'friend',
    'enemigo': 'enemy',
    'judío': 'Jew',
    'gentil': 'Gentile',
    'israel': 'Israel',
    'jerusalén': 'Jerusalem',
    
    // Adjectives / Adverbs
    'bueno': 'good',
    'malo': 'bad',
    'grande': 'great',
    'pequeño': 'small',
    'nuevo': 'new',
    'viejo': 'old',
    'antiguo': 'ancient',
    'alto': 'high',
    'bajo': 'low',
    'fuerte': 'strong',
    'débil': 'weak',
    'rico': 'rich',
    'pobre': 'poor',
    'bello': 'beautiful',
    'hermoso': 'beautiful',
    'justo': ['righteous', 'just'],
    'impío': 'wicked',
    'eterno': 'eternal',
    'verdadero': 'true',
    'falso': 'false',
    'vivo': 'living',
    'muerto': 'dead',
    'lleno': 'full',
    'vacío': 'empty',
    'puro': 'pure',
    'inmundo': 'unclean',
    'digno': 'worthy',
    'feliz': 'happy',
    'bienaventurado': 'blessed',
    'amado': 'beloved',
    'único': 'only',
    'unigénito': 'only begotten',
    'primogénito': 'firstborn',
    'ahora': 'now',
    'entonces': 'then',
    'siempre': 'always',
    'nunca': 'never',
    'jamás': 'never',
    'quizás': 'perhaps',
    'sí': 'yes',
    'no': 'no',
    'muy': 'very',
    'más': 'more',
    'menos': 'less',
    'tan': 'so',
    'tanto': 'so much',
  };

  private cache: CacheService;
  private normalizedDictionary: Record<string, string | string[]> = {};

  constructor(cache: CacheService) {
    this.cache = cache;
    this.initializeNormalizedDictionary();
  }

  /**
   * Pre-normalize dictionary keys to handle accents correctly
   * e.g. 'creó' -> 'creo', 'él' -> 'el'
   */
  private initializeNormalizedDictionary() {
    Object.keys(this.wordDictionary).forEach(key => {
      const normalizedKey = this.normalizeWord(key);
      // If key collision occurs (unlikely with current set but possible),
      // we might want to merge arrays, but for now last write wins
      // or we can keep both if they map to same value.
      // A safer approach is to just add the normalized version pointing to the same value
      this.normalizedDictionary[normalizedKey] = this.wordDictionary[key];
      
      // Also keep the original key if it's different (though normalizeWord is used for lookup)
      if (normalizedKey !== key.toLowerCase()) {
        this.normalizedDictionary[key.toLowerCase()] = this.wordDictionary[key];
      }
    });
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
      // Only use the first translation option for full text fallback
      const cleanWord = this.normalizeWord(word);
      let trans = this.normalizedDictionary[cleanWord];
      
      if (!trans) {
         trans = this.wordDictionary[word.toLowerCase()];
      }
      
      return Array.isArray(trans) ? trans[0] : (trans || word);
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
   */
  async translateText(text: string, fromLang: string = 'es', toLang: string = 'en'): Promise<TranslationResult> {
    return this.translateTextWithDictionary(text);
  }

  /**
   * Translate a single word using the dictionary AND context from the full English verse
   * This attempts to match the specific English word used in the KJV verse
   */
  async translateWord(
    word: string, 
    fromLang: string = 'es', 
    toLang: string = 'en',
    contextVerse?: string
  ): Promise<string> {
    // Do not cache if context is provided, as the same word might have different translations in different verses
    const cacheKey = `word-translation-${word}-${fromLang}-${toLang}`;
    
    if (!contextVerse) {
      const cached = this.cache.getCachedData(cacheKey);
      if (cached) return cached;
    }

    const cleanWord = this.normalizeWord(word);
    let translationCandidates = this.normalizedDictionary[cleanWord];

    // If no translation found, try raw lowercase lookup as fallback
    if (!translationCandidates) {
       translationCandidates = this.wordDictionary[word.toLowerCase()];
    }

    // If still no translation found, return original (capitalized if needed)
    if (!translationCandidates) {
      return word;
    }

    // Normalize candidates to array
    const candidates = Array.isArray(translationCandidates) 
      ? translationCandidates 
      : [translationCandidates];

    // If we have context, try to find which candidate is actually used in the English verse
    if (contextVerse) {
      const contextLower = contextVerse.toLowerCase();
      
      // 1. Exact match check
      for (const candidate of candidates) {
        // Check if the candidate word appears in the English text
        // We use word boundaries to avoid matching substrings (e.g. "he" in "the")
        const regex = new RegExp(`\\b${candidate.toLowerCase()}\\b`);
        if (regex.test(contextLower)) {
          // Return the candidate
          return candidate; 
        }
      }
      
      // 2. If no exact match, check for lemma/root match (simplified: starts with)
      // e.g. dictionary has "create", text has "created"
      for (const candidate of candidates) {
        const root = candidate.toLowerCase().replace(/e$/, ''); // simple heuristic for some English verbs
        if (contextLower.includes(root)) {
           return candidate;
        }
      }
    }

    // Default: return the first candidate
    const result = candidates[0];

    if (!contextVerse) {
      this.cache.setCachedData(cacheKey, result, 3600);
    }
    
    return result;
  }

  /**
   * Compute alignment between Spanish and English text
   * Returns a Map where key is Spanish word index and value is array of English word indices
   */
  computeAlignment(spanishText: string, englishText: string): Map<number, number[]> {
    const alignmentMap = new Map<number, number[]>();
    
    // Tokenize words (preserving indices)
    const spanishWords = spanishText.split(' ');
    const englishWords = englishText.split(' ');
    
    // Create a map of English words to their indices for faster lookup
    // Word -> [index1, index2, ...]
    const englishWordIndices: Record<string, number[]> = {};
    englishWords.forEach((word, index) => {
      const cleanWord = this.normalizeWord(word);
      if (!englishWordIndices[cleanWord]) {
        englishWordIndices[cleanWord] = [];
      }
      englishWordIndices[cleanWord].push(index);
    });

    // Iterate through Spanish words to find matches
    spanishWords.forEach((spanishWord, sIndex) => {
      const cleanSpanish = this.normalizeWord(spanishWord);
      
      // Look up in normalized dictionary
      let candidates = this.normalizedDictionary[cleanSpanish];
      
      // Fallback to direct dictionary lookup if normalized failed
      if (!candidates) {
        candidates = this.wordDictionary[spanishWord.toLowerCase()];
      }
      
      if (!candidates) return;
      
      const candidateList = Array.isArray(candidates) ? candidates : [candidates];
      
      // Find all potential matches in English text
      let bestMatchIndices: number[] = [];
      let bestDistance = Infinity;
      
      for (const candidate of candidateList) {
        const cleanCandidate = this.normalizeWord(candidate);
        const indices = englishWordIndices[cleanCandidate];
        
        if (indices && indices.length > 0) {
          // Heuristic: Select match closest to relative position
          // Relative position of Spanish word: sIndex / spanishWords.length
          // Expected English index: (sIndex / spanishWords.length) * englishWords.length
          
          const expectedIndex = (sIndex / spanishWords.length) * englishWords.length;
          
          // Find the index closest to expectedIndex
          const closestIndex = indices.reduce((prev, curr) => {
            return (Math.abs(curr - expectedIndex) < Math.abs(prev - expectedIndex) ? curr : prev);
          });
          
          // Check if this is the best match so far across all candidates
          const distance = Math.abs(closestIndex - expectedIndex);
          
          if (distance < bestDistance) {
            bestDistance = distance;
            bestMatchIndices = [closestIndex];
          } else if (Math.abs(distance - bestDistance) < 0.1) {
             // If distance is very similar, include it (ambiguous case)
             bestMatchIndices.push(closestIndex);
          }
        }
      }
      
      if (bestMatchIndices.length > 0) {
        alignmentMap.set(sIndex, bestMatchIndices);
      }
    });
    
    return alignmentMap;
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
