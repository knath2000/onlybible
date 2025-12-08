# Consolidated Learnings: Bible Reading App Development

## API Integration Patterns

### Dual-Mode API Service
**Pattern**: Implement services that can toggle between mock data (development) and real API (production)

**Implementation**:
```typescript
class BibleService {
  private useMockData: boolean = true;

  async fetchData() {
    if (this.useMockData) {
      return mockData; // Development mode
    } else {
      return await realApiCall(); // Production mode
    }
  }

  setUseMockData(useMock: boolean) {
    this.useMockData = useMock;
  }
}
```

**Benefits**:
- Avoids CORS issues during development
- Enables testing without external dependencies
- Smooth transition to production
- Graceful fallback when APIs fail

### CORS Handling Strategies
**Approaches for Production**:
1. **Server-Side Proxy**: Next.js API routes
2. **CORS Proxy Service**: Middleware like cors-anywhere
3. **Platform Deployment**: Vercel automatic CORS handling
4. **Backend Service**: Dedicated API server

## Error Handling Patterns

### Automatic Fallback System
**Pattern**: When API calls fail, automatically fall back to mock data

```typescript
try {
  const response = await fetch(apiUrl);
  if (!response.ok) throw new Error('API failed');
  return await response.json();
} catch (error) {
  console.error('API error:', error);
  return mockData; // Automatic fallback
}
```

**Key Insights**:
- Prevents app crashes during API failures
- Maintains user experience continuity
- Logs errors for debugging while keeping app functional

## Mock Data Architecture

### Comprehensive Mock System
**Structure**:
```typescript
// mockBibleData.ts
export const mockBibleData = {
  'génesis': {
    1: {
      1: 'En el principio creó Dios los cielos y la tierra.',
      // ... more verses
    }
    // ... more chapters
  }
  // ... more books
};

export const mockBooks = ['Génesis', 'Éxodo', ...];
export const mockChapters = {'Génesis': 50, ...};
```

**Best Practices**:
- Mirror real API data structure
- Include comprehensive coverage (all books, chapters)
- Add sample content for key passages
- Maintain consistent data types

## Next.js Integration Patterns

### App Router with Context
**Effective Pattern**:
```typescript
// BibleContext.tsx
export const BibleProvider = ({ children }) => {
  const [state, dispatch] = useReducer(bibleReducer, initialState);

  // API methods
  const fetchVerse = async (book, chapter, verse) => {
    // Use bibleService with proper error handling
  };

  return (
    <BibleContext.Provider value={{ state, fetchVerse, ... }}>
      {children}
    </BibleContext.Provider>
  );
};
```

**Key Learnings**:
- Use React Context for global state
- Combine with useReducer for complex state logic
- Initialize services at context level
- Provide clean component interfaces

## Glassmorphic UI Implementation

### Component Architecture
**Reusable Components**:
```typescript
// GlassCard.tsx
export const GlassCard = ({ children }) => (
  <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg p-6">
    {children}
  </div>
);

// GlassButton.tsx
export const GlassButton = ({ children, onClick }) => (
  <button className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-4 py-2 hover:bg-white/30 transition-all">
    {children}
  </button>
);
```

**Design System**:
```css
:root {
  --glass-bg: rgba(255, 255, 255, 0.1);
  --glass-border: rgba(255, 255, 255, 0.2);
  --blur-value: 10px;
}

.glass-effect {
  background: var(--glass-bg);
  backdrop-filter: blur(var(--blur-value));
  border: 1px solid var(--glass-border);
}
```

## Translation System Architecture

### Multi-Level Translation
**Implementation**:
```typescript
// Verse-level translation
const translateVerse = async (text) => {
  return translationService.translateText(text);
};

// Word-level translation with tooltips
const WordTranslationTooltip = ({ word, children }) => {
  const [translation, setTranslation] = useState(null);

  const handleMouseEnter = async () => {
    const translated = await translateWord(word);
    setTranslation(translated);
  };

  return (
    <span onMouseEnter={handleMouseEnter}>
      {children}
      {translation && <Tooltip>{translation}</Tooltip>}
    </span>
  );
};
```

**Key Patterns**:
- Separate verse and word translation services
- Cache translations for performance
- Use tooltips for word-level interactions
- Maintain translation state in context

## Performance Optimization

### Caching Strategy
```typescript
class CacheService {
  private cache = new Map();

  setCachedData(key, data, ttl) {
    const expires = Date.now() + (ttl * 1000);
    this.cache.set(key, { data, expires });
  }

  getCachedData(key) {
    const cached = this.cache.get(key);
    if (!cached || cached.expires < Date.now()) return null;
    return cached.data;
  }
}

// Usage in services
const cacheKey = `verse-${book}-${chapter}-${verse}`;
const cached = cacheService.getCachedData(cacheKey);
if (cached) return cached;

// After fetching
cacheService.setCachedData(cacheKey, data, 86400); // 24-hour cache
```

**Caching Levels**:
- Bible verses: 24-hour cache
- Translations: 1-hour cache
- Book/chapter metadata: Long-term cache

## Project Management Insights

### Effective Development Workflow
1. **Architecture First**: Design system before implementation
2. **Incremental Testing**: Test components as they're built
3. **Error Handling Early**: Implement robust error handling from start
4. **Mock Data Strategy**: Develop with mock data, switch to real API later
5. **Documentation Parallel**: Create docs alongside development

### Next.js Best Practices
- Use App Router for modern structure
- Implement client components properly with 'use client'
- Leverage Tailwind CSS for rapid UI development
- Use TypeScript for type safety and better tooling
- Organize services and components logically

## Production Deployment Checklist

### CORS Resolution Options
1. **Next.js API Routes**:
   ```typescript
   // app/api/bible/route.ts
   export async function GET(request) {
     const { book, chapter, verse } = request.nextUrl.searchParams;
     const response = await fetch(`https://biblia-api.vercel.app/api/v1/${book}/${chapter}/${verse}`);
     return Response.json(await response.json());
   }
   ```

2. **Vercel Deployment**:
   - Deploy to Vercel platform
   - Configure CORS headers in vercel.json
   - Use Vercel's automatic CORS handling

3. **CORS Proxy**:
   ```typescript
   const proxyUrl = `https://cors-anywhere.herokuapp.com/https://biblia-api.vercel.app/api/v1/${book}/${chapter}/${verse}`;
   ```

### Performance Optimization
- Implement server-side rendering for key pages
- Add prefetching for adjacent chapters
- Configure proper caching headers
- Optimize images and assets
- Implement lazy loading for non-critical components

## Stacked Verses & Audio (Latest Session)
- Use a small sliding window of nearby verses to deliver a stacked vertical layout without full-chapter fetches
- Prefetch English translations for the window to enable instant toggle and context-aware hover
- Per-verse TTS buttons should pause/reset any currently playing audio before starting new playback

## API Integration Patterns (December 2025 Updates)

### Biblia.com API Integration (December 2025)
**Pattern**: Domain-restricted API with proper authentication and error handling

**Implementation**:
```typescript
// Enhanced API Route with comprehensive error handling
export async function GET(request: NextRequest): Promise<NextResponse> {
  // ... (see full implementation in codebase)
  const apiKey = process.env.BIBLIA_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json(
      { error: 'API key not configured' },
      { status: 500 }
    );
  }
  // ...
}
```

**Key Insights**:
- **Domain Restrictions**: API keys can be restricted to specific domains
- **Comprehensive Logging**: Detailed error logging helps diagnose issues quickly
- **User-Agent Headers**: Proper headers improve API compatibility
- **Timeout Management**: 15-second timeouts balance responsiveness and reliability
- **Cache Headers**: Proper caching improves performance and reduces API calls

### API-Only Architecture
**Pattern**: Remove mock data entirely, rely solely on external API

**Implementation**:
```typescript
class BibleService {
  private useMockData: boolean = false; // API-only mode

  async fetchVerse(book: string, chapter: number, verse: number): Promise<BibleVerse> {
    // ...
    return {
      reference: `${book} ${chapter}:${verse}`,
      text: data.text || 'Versículo no encontrado',
      translation: data.translation || 'RVR60',
      verse: verse,
      chapter: chapter,
      book: book
    };
  }
}
```

**Benefits**:
- **Simplified Architecture**: No need to maintain mock data
- **Real Content**: Always serves authentic Bible content
- **Reduced Complexity**: Eliminates mock/real switching logic
- **Better Error Handling**: Forces proper API error management

## Error Handling Patterns (December 2025 Updates)

### Enhanced Error Handling with User Feedback
**Pattern**: Multi-level error detection with user-friendly messages

**Key Insights**:
- **Built-in Diagnostics**: "Probar Conexión" button for immediate testing
- **User-Friendly Messages**: Spanish error messages with actionable steps
- **Debug Information**: Detailed technical information for developers
- **Error Recovery**: Clear options for users to resolve issues

### Error Prevention and Security
**Pattern**: API key security and domain restriction management

**Security Best Practices**:
- **Never Expose API Keys**: Remove exposed keys and regenerate
- **Environment Variables**: Use proper environment variable management
- **Domain Registration**: Register all deployment domains with API provider
- **Error Logging**: Log errors without exposing sensitive information

## Component Architecture (December 2025 Updates)

### Dedicated Spanish Bible Reader
**Pattern**: Specialized component with built-in diagnostics and error handling

**Key Features**:
- **Verse Selector Fix**: Proper verse population logic implemented
- **Built-in Testing**: "Probar Conexión" button for immediate diagnostics
- **Comprehensive Error Handling**: User-friendly Spanish error messages
- **Debug Information**: Technical details for troubleshooting
- **Step-by-Step Guidance**: Clear troubleshooting instructions for users

## Vercel Deployment Patterns (December 2025 Updates)

### Production Deployment Configuration
**Pattern**: Complete Vercel deployment with domain-restricted API integration

**Deployment Insights**:
- **Environment Variables**: Must be configured across all Vercel environments
- **Domain Registration**: Critical for domain-restricted API keys
- **Testing Strategy**: Built-in testing tools help verify deployment success
- **Error Monitoring**: Vercel logs provide detailed debugging information

## Project Management Insights (December 2025 Updates)

### API Integration Challenges (December 2025)
**Key Learnings**:
1. **Domain Restrictions**: API keys can be restricted to specific domains, requiring careful configuration
2. **Error Handling**: Comprehensive error messages improve user experience significantly
3. **Built-in Diagnostics**: Diagnostic buttons help identify issues quickly
4. **Security Considerations**: API key exposure requires immediate regeneration
5. **Vercel Configuration**: Environment variables must be properly configured across all environments
6. **User Experience**: Spanish error messages and troubleshooting steps improve usability
7. **Debugging Process**: Comprehensive logging helps identify API integration issues
8. **Deployment Preparation**: Detailed documentation ensures smooth production deployment

### Best Practices Established
1. **API-First Architecture**: Remove mock data entirely for production applications
2. **Comprehensive Error Handling**: Multi-level error detection with user-friendly messages
3. **Built-in Diagnostics**: Include testing tools in the application interface
4. **Security First**: Protect API keys and implement proper environment variable management
5. **User Experience**: Provide clear error messages and troubleshooting steps in the user's language
6. **Deployment Ready**: Create comprehensive deployment guides with troubleshooting
7. **Documentation**: Maintain detailed documentation of all decisions and learnings

## Production Deployment Checklist (December 2025 Updates)

### Pre-Deployment
- [x] API integration complete with Biblia.com
- [x] Error handling enhanced with detailed logging
- [x] UI components complete with Spanish Bible reader
- [x] Environment variables properly configured
- [x] Vercel deployment guide created
- [x] Built-in testing tools implemented
- [x] Security considerations addressed

### Post-Deployment
- [ ] Deploy to Vercel with domain-restricted API key
- [ ] Test API integration with Vercel domain
- [ ] Monitor performance and error rates
- [ ] Validate Spanish Bible reading functionality
- [ ] Regenerate API key for production use
- [ ] Update environment variables with new API key

### Performance Optimization
- [x] API route caching headers configured (1-hour cache)
- [x] 15-second timeout for API requests
- [x] Proper User-Agent headers for API compatibility
- [x] Comprehensive error logging for monitoring

## Key Takeaways (December 2025)

1. **API Integration Complexity**: Domain-restricted API keys add complexity but improve security
2. **Error Handling Criticality**: Comprehensive error handling significantly improves user experience
3. **Built-in Diagnostics**: Including testing tools in the application interface speeds up troubleshooting
4. **Security Awareness**: API key exposure is a serious security concern requiring immediate action
5. **Documentation Value**: Comprehensive deployment guides ensure successful production deployments
6. **User Experience Focus**: Spanish error messages and troubleshooting steps improve usability for target audience
7. **Debugging Importance**: Detailed logging helps quickly identify and resolve API integration issues
8. **Deployment Preparation**: Thorough preparation including environment configuration and domain registration is essential
9. **API-Only Architecture**: Removing mock data simplifies architecture but requires robust error handling
10. **Continuous Learning**: Each integration challenge provides valuable lessons for future projects
11. **Unicode Normalization**: Always normalize accented characters using NFD before lookups
12. **Free APIs First**: Evaluate free Bible APIs before paid services - often sufficient
13. **Real Translations Over Machine**: Using actual Bible verses provides better accuracy than machine translation
14. **Separate Loading States**: Different operations (fetch vs translate) deserve separate loading indicators
15. **Toggle State Optimization**: Cache translations and toggle visibility rather than re-fetching
16. **Auto-Clear Strategy**: Clear dependent data (translations) when source data (verses) changes

## Context-Aware Translation (December 2025)

### Fuzzy Matching Pattern
**Problem**: Words like "tierra" can mean "earth" or "land". Dictionary lookups are ambiguous.
**Solution**: Cross-reference dictionary candidates against the actual English translation of the verse.

**Implementation**:
```typescript
async translateWord(word, contextVerse) {
  const candidates = dictionary[word]; // ['earth', 'land']
  
  if (contextVerse) {
    // Check if any candidate appears in the actual verse text
    for (const candidate of candidates) {
      if (contextVerse.toLowerCase().includes(candidate.toLowerCase())) {
        return candidate; // Return the one that matches context
      }
    }
  }
  
  return candidates[0]; // Fallback
}
```

**Key Insight**: 
- Drastically improves perceived accuracy.
- Requires access to full verse translation even for single word lookups.
- Solved by background fetching the full translation when the verse loads.

### TypeScript Object Literal Constraints
**Learning**: TypeScript compilers (and build tools like Turbopack) are strict about duplicate keys in object literals.
**Issue**:
```typescript
const dict = {
  'fue': 'was',
  // ... 100 lines later ...
  'fue': 'went' // Error! Duplicate identifier
}
```
**Fix**:
```typescript
const dict = {
  'fue': ['was', 'went'] // Use array for multiple meanings
}
```
**Takeaway**: Always consolidate definitions for polysemous words into a single entry, preferably an array.

## Word Alignment & Visual Mapping (Latest Session)

### Alignment Algorithm Pattern
**Problem**: Need to visually connect Spanish words to their English equivalents in the verse.

**Solution**: Multi-step alignment process:
1. Tokenize both Spanish and English texts
2. For each Spanish word, look up candidates in dictionary
3. Find matches in English word array
4. Use positional heuristic: select English word closest to relative position
5. Return mapping: `Map<SpanishIndex, EnglishIndex[]>`

**Implementation**:
```typescript
computeAlignment(spanishText: string, englishText: string): Map<number, number[]> {
  // Tokenize
  const spanishWords = spanishText.split(' ');
  const englishWords = englishText.split(' ');
  
  // Build English word index map
  const englishWordIndices: Record<string, number[]> = {};
  englishWords.forEach((word, index) => {
    const cleanWord = normalizeWord(word);
    if (!englishWordIndices[cleanWord]) {
      englishWordIndices[cleanWord] = [];
    }
    englishWordIndices[cleanWord].push(index);
  });
  
  // Match Spanish to English using dictionary + position
  spanishWords.forEach((spanishWord, sIndex) => {
    const candidates = dictionary[normalizeWord(spanishWord)];
    // Find best match using positional heuristic
    // ...
  });
}
```

**Key Insights**:
- **Positional Heuristic**: `expectedIndex = (sIndex / spanishLength) * englishLength` helps disambiguate multiple matches
- **Dictionary First**: Only align words that exist in dictionary (high accuracy, lower coverage)
- **Multiple Targets**: One Spanish word can map to multiple English words (array return type)

### SVG Overlay Pattern
**Problem**: Need to draw dynamic lines between words that may be at different positions.

**Solution**: SVG overlay with absolute positioning and Bezier curves.

**Implementation**:
```typescript
// AlignmentOverlay.tsx
<svg className="absolute inset-0 pointer-events-none">
  <defs>
    <linearGradient id="gold-gradient">...</linearGradient>
  </defs>
  {targetRects.map((targetRect, index) => {
    const start = getRelativePoint(sourceRect, 'bottom');
    const end = getRelativePoint(targetRect, 'top');
    const pathData = `M ${start.x} ${start.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${end.x} ${end.y}`;
    return <path d={pathData} stroke="url(#gold-gradient)" />;
  })}
</svg>
```

**Key Insights**:
- **Absolute Positioning**: SVG positioned absolutely over verse card
- **Relative Coordinates**: Calculate positions relative to container for accurate placement
- **Bezier Curves**: Cubic Bezier paths create smooth, elegant connections
- **Animation**: CSS animations (draw-line) provide smooth appearance
- **Pointer Events**: `pointer-events-none` prevents SVG from blocking interactions

### DOM Refs Pattern for Word Positioning
**Problem**: Need to get exact screen coordinates of word elements for line drawing.

**Solution**: Use React refs to capture element references and calculate bounding boxes.

**Implementation**:
```typescript
const spanishWordRefs = useRef<(HTMLElement | null)[]>([]);
const englishWordRefs = useRef<(HTMLElement | null)[]>([]);

// In render
{spanishWords.map((word, index) => (
  <span ref={el => { spanishWordRefs.current[index] = el; }}>
    {word}
  </span>
))}

// On hover
const spanishEl = spanishWordRefs.current[hoveredWordIndex];
const spanishRect = spanishEl.getBoundingClientRect();
const containerRect = containerRef.current.getBoundingClientRect();
```

**Key Insights**:
- **Ref Arrays**: Use arrays to store refs for multiple elements
- **BoundingClientRect**: Provides precise position and size information
- **Relative Calculation**: Subtract container position for accurate overlay coordinates
- **Reset on Change**: Clear and reinitialize refs when text changes

## Book Name Parsing (Latest Session)

### Right-to-Left Parsing Pattern
**Problem**: Multi-word book names like "2 Reyes" break when parsing "2 Reyes 1:1" because spaces are converted to `+` and then split incorrectly.

**Solution**: Parse from right to left (verse → chapter → book).

**Implementation**:
```typescript
// Find verse (after last colon)
const lastColonIndex = passage.lastIndexOf(':');
const verse = parseInt(passage.substring(lastColonIndex + 1)) || 1;

// Find chapter (last number before colon)
const bookChapterPart = passage.substring(0, lastColonIndex).trim();
const chapterMatch = bookChapterPart.match(/(\d+)\s*$/);
const chapter = parseInt(chapterMatch[1]) || 1;

// Everything before chapter is book name
const chapterIndex = bookChapterPart.lastIndexOf(chapterMatch[1]);
const spanishBookName = bookChapterPart.substring(0, chapterIndex).trim();
```

**Key Insights**:
- **Right-to-Left**: Parsing from end ensures correct extraction of verse and chapter
- **Regex for Chapter**: `/(\d+)\s*$/` matches last number at end of string
- **Preserve Spaces**: Don't convert spaces to `+` until after parsing book name
- **Edge Cases**: Handle missing chapter/verse gracefully with defaults

## Dictionary Normalization (Latest Session)

### Pre-Normalization Pattern
**Problem**: Dictionary keys like `'creó'` contain accents, but `normalizeWord()` strips accents before lookup, causing misses.

**Solution**: Normalize all dictionary keys at construction time.

**Implementation**:
```typescript
private normalizedDictionary: Record<string, string | string[]> = {};

constructor(cache: CacheService) {
  this.cache = cache;
  this.initializeNormalizedDictionary();
}

private initializeNormalizedDictionary() {
  Object.keys(this.wordDictionary).forEach(key => {
    const normalizedKey = this.normalizeWord(key);
    this.normalizedDictionary[normalizedKey] = this.wordDictionary[key];
    
    // Also keep original key if different
    if (normalizedKey !== key.toLowerCase()) {
      this.normalizedDictionary[key.toLowerCase()] = this.wordDictionary[key];
    }
  });
}
```

**Key Insights**:
- **Construction-Time**: Normalize once at initialization, not on every lookup
- **Dual Storage**: Keep both normalized and original keys for maximum compatibility
- **Performance**: Pre-computation avoids repeated normalization overhead
- **Accent Handling**: Ensures words like "creó" are found even when normalized to "creo"

## API Fallback Strategy (Latest Session)

### External Translation API Integration
**Problem**: Local dictionary can't cover all words; need fallback for unknown terms.

**Solution**: Integrate MyMemory API as fallback when dictionary lookup fails.

**Implementation**:
```typescript
// New API route: /api/translate/word
export async function GET(request: Request) {
  const word = searchParams.get('word');
  const response = await fetch(
    `https://api.mymemory.translated.net/get?q=${word}&langpair=es|en`
  );
  return NextResponse.json({ translation: data.responseData.translatedText });
}

// In TranslationService
if (!translationCandidates) {
  const apiTranslation = await this.fetchWordTranslation(word);
  if (apiTranslation) {
    // Cache and add to dictionary
    this.wordDictionary[cleanWord] = apiTranslation;
    translationCandidates = [apiTranslation];
  }
}
```

**Key Insights**:
- **Free Tier**: MyMemory offers 5000 words/day without API key
- **Caching**: Cache API responses for 24 hours to minimize requests
- **Dictionary Update**: Add successful API translations to local dictionary
- **Graceful Degradation**: Return original word if API also fails
- **Rate Limiting**: Free tier sufficient for typical usage patterns

## Audio TTS (Latest Session)

### Cloud TTS Proxy Pattern
**Problem**: Need tap-to-listen audio for verses with minimal client complexity.

**Solution**: Add a server-side `/api/tts` route that proxies to Azure Speech, returning MP3 audio.

**Implementation**:
```typescript
// /api/tts (Azure Speech)
const ssml = `<speak version='1.0' xml:lang='${lang}'><voice xml:lang='${lang}' name='${voice}'>${text}</voice></speak>`;
fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, { headers, body: ssml });
```

**Key Insights**:
- **Env Config**: `TTS_PROVIDER`, `TTS_API_KEY`, `TTS_REGION`, `TTS_VOICE` (e.g., es-ES-AlvaroNeural)
- **Output Format**: MP3 24kHz/48kbps mono for good quality/size
- **Error Handling**: Return JSON error on provider failure; keep UI responsive
- **Caching**: Potential to cache by hash(text+voice) for 24h if needed

### Client Playback Pattern
**Problem**: Play returned audio without heavy player dependencies.

**Solution**: Use `new Audio(objectUrl)` with loading/playing flags and cleanup.

**Implementation**:
```typescript
const res = await fetch(`/api/tts?text=...`);
const blob = await res.blob();
const url = URL.createObjectURL(blob);
const audio = new Audio(url);
audio.onended = () => setIsPlaying(false);
await audio.play();
```

**Key Insights**:
- **Cleanup**: Revoke object URLs on unmount and pause previous audio
- **States**: Track `isTtsLoading` and `isPlaying` for UI feedback
- **Fallback**: If no key/config, show error; consider Web Speech fallback later
