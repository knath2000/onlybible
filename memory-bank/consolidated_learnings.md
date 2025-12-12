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

### Mixed-Content & CORS Prevention (Dec 2025)
- Use **relative `/api/...` URLs** in browser fetches so deployments inherit the correct origin and avoid HTTPS/HTTP mixed-content blocks.
- Add **CORS headers** and an **`OPTIONS` handler** in App Router routes (`/api/bible`, `/api/bible/english`) to unblock cross-origin dev/testing while keeping upstream calls HTTPS.
- Align client parsing to the proxy **`verses[]` response shape** (read `text`/`content` fields) instead of relying on legacy `passage` payloads to prevent "Versículo no encontrado" regressions.

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
- Settings-driven autoplay: toggle lives in Settings; when enabled, playback auto-advances to the next verse; disabling stops autoplay immediately and pauses audio

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

## Infinite Scrolling Implementation (Latest Session)

### TanStack Query Integration
**Pattern**: Use `useInfiniteQuery` for efficient pagination and caching of verse chunks.

**Implementation**:
```typescript
const { data, fetchNextPage } = useInfiniteQuery({
  queryKey: ['infinite-verses', book, chapter],
  queryFn: ({ pageParam }) => fetchVerseRange(..., pageParam),
  getNextPageParam: (lastPage, allPages) => ...
});
```

**Key Insights**:
- **Automatic Caching**: TanStack Query handles caching and stale-while-revalidate logic out of the box.
- **Simplified State**: Reduces boilerplate in `BibleContext` by offloading fetch logic.
- **Integration**: Syncing TanStack state to a global reducer allows for a hybrid approach where UI components consume context but data logic is managed by the library.

## API Route Mode Detection & Range Fetching (Latest Session)

### Query Parameter Mode Detection
**Pattern**: Use `request.nextUrl.searchParams.has()` for explicit mode detection instead of relying on defaulted parameter values.

**Implementation**:
```typescript
// ❌ Wrong: Defaulted values cause confusion
const startVerse = parseInt(searchParams.get('startVerse') || '1');
const endVerse = parseInt(searchParams.get('endVerse') || '1');

// ✅ Correct: Check presence explicitly
const hasStart = searchParams.has('startVerse');
const hasEnd = searchParams.has('endVerse');
const hasVerse = searchParams.has('verse');

if (hasStart && hasEnd) {
  // Range mode
} else if (hasVerse) {
  // Single verse mode
}
```

**Key Insights**:
- **Prevents Accidental Modes**: Defaulted parameters can accidentally trigger range mode when user intends single verse.
- **Clear Intent**: `has()` method clearly distinguishes between "missing" and "present but empty".
- **Type Safety**: Avoids `NaN` from parsing undefined strings.

### Chapter-Slice Range Fetching
**Pattern**: Fetch entire chapter once, then slice the `text[]` array for range requests instead of N parallel single-verse calls.

**Implementation**:
```typescript
// Fetch whole chapter
const chapterUrl = `${bibleApiBase}/${normalizedBook}/${chapterNum}`;
const chapterData = await fetch(chapterUrl).then(r => r.json());

// Clamp and slice
const safeStart = Math.max(1, startVerse);
const safeEnd = Math.min(endVerse, chapterData.verses);
const slicedVerses = chapterData.text.slice(safeStart - 1, safeEnd).map((text, i) => ({
  verse: safeStart + i,
  text: text || 'Verse not available'
}));
```

**Key Insights**:
- **Efficient Network Usage**: One HTTP request instead of N parallel requests.
- **Server-Side Clamping**: Authoritative verse count prevents over-fetching.
- **Atomic Operations**: Either get whole chapter or fail, no partial range results.

### Meta Endpoint for Verse Counts
**Pattern**: Separate lightweight endpoint returning only chapter metadata to eliminate hardcoded verse count tables.

**Implementation**:
```typescript
// GET /api/bible?meta=1&book=Génesis&chapter=1
// Returns: { book: "Génesis", chapter: 1, chapterVerseCount: 31 }

// Client usage
const count = await fetch(`/api/bible?book=${book}&chapter=${chapter}&meta=1`)
  .then(r => r.json())
  .then(data => data.chapterVerseCount);
```

**Key Insights**:
- **Authoritative Data**: Always reflects true chapter length from upstream API.
- **Lightweight**: Minimal payload, fast response.
- **Dynamic Updates**: No need to maintain static count tables.

## English Proxy Response Shape Alignment (Latest Session)

### Upstream API Response Patterns
**Pattern**: bible-api.com returns consistent JSON structure with `verses[]` array, not just concatenated text.

**Response Structure**:
```json
{
  "reference": "John 3:16",
  "verses": [
    {
      "book_id": "JHN",
      "book_name": "John",
      "chapter": 3,
      "verse": 16,
      "text": "For God so loved the world..."
    }
  ],
  "text": "For God so loved the world...",
  "translation_id": "kjv",
  "translation_name": "King James Version"
}
```

**Key Insights**:
- **Array-First**: Use `data.verses` array instead of splitting `data.text` by newlines.
- **Robust Parsing**: Handles API response variations gracefully.
- **Future-Proof**: Works with range responses that return multiple verses.

### Bulk Translation with Range Caching
**Pattern**: When enabling translations, fetch English for entire loaded range in one batch request.

**Implementation**:
```typescript
const translateVerse = async () => {
  if (state.showTranslation) {
    dispatch({ type: 'TOGGLE_TRANSLATION' });
    return;
  }

  // Get range of currently loaded infinite verses
  const minVerse = Math.min(...state.infiniteVerses.map(v => v.verse));
  const maxVerse = Math.max(...state.infiniteVerses.map(v => v.verse));

  // Fetch all at once
  await translationService.fetchEnglishRange(
    state.currentBook,
    state.currentChapter,
    minVerse,
    maxVerse
  );

  dispatch({ type: 'TOGGLE_TRANSLATION' });
};
```

**Key Insights**:
- **Batch Efficiency**: One request covers all visible verses.
- **Cache Priming**: Range fetch populates individual verse caches automatically.
- **User Experience**: Translations appear instantly when scrolling with translation enabled.

## Eliminating Phantom Verses at Chapter End (Latest Session)

### Defense-in-Depth Chapter Boundary Enforcement
**Pattern**: Enforce chapter boundaries at multiple layers to prevent “Error loading verse 32” cards:

1. **Server**: validate upstream chapter shape before slicing (`verses` is a number, `text` is an array).
2. **Client service**: sanitize range results (filter out-of-range verse numbers and known placeholder strings) before caching/returning.
3. **Pagination**: stop infinite pagination based on `chapterVerseCount`, not `lastPage.length`.

**Key Insights**:
- **Never Trust Page Length**: `lastPage.length === chunkSize` is not a reliable end-of-data signal if placeholder items can exist.
- **Authoritative Stop Condition**: Use chapter verse count (`chapterVerseCount`) to compute `nextStart` and return `undefined` when done.
- **Safety Net Filtering**: Even with a correct backend, stale caches or unexpected payloads can leak invalid entries; filter them out client-side.

### Cache Busting for Infinite Lists
**Pattern**: Include `chunkSize` and a schema/version token in the infinite query key to prevent stale cached pages from resurfacing after a behavior change.

**Implementation**:
```typescript
const queryKey = ['infinite-verses', book, chapter, chunkSize, 'v2'] as const;
```

### TanStack Query TypeScript: pageParam and InfiniteData
**Pattern**: `pageParam` is `unknown` unless you specify generics; `data` is `InfiniteData<TPage>`, not `TPage`.

**Implementation**:
```typescript
type Page = { verses: BibleVerse[]; chapterVerseCount: number };
const queryKey = ['infinite-verses', book, chapter, chunkSize, 'v2'] as const;

useInfiniteQuery<
  Page,
  Error,
  InfiniteData<Page, number>,
  typeof queryKey,
  number
>({ /* ... */ });
```

**Key Insights**:
- Avoids compile errors like `pageParam is of type unknown` and `pages does not exist`.
- Makes pagination logic type-safe and resilient to refactors.

### Infinite Scroll UI
**Pattern**: Intersection Observer API for detecting scroll position and triggering data loads.

**Implementation**:
```typescript
const observer = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting && hasNextPage) {
    loadNextVerses();
  }
});
```

**Key Insights**:
- **Performance**: Native Observer is more performant than scroll event listeners.
- **UX**: Adding a "sentinel" element at the bottom of the list provides a reliable trigger point.
- **Feedback**: Loading spinners and end-of-chapter messages are critical for user awareness.

### Hybrid Navigation
**Pattern**: Combine infinite scroll with traditional jump controls (dropdowns, search).

**Key Insights**:
- **Flexibility**: Users want to browse continuously but also need to jump to specific passages.
- **Deep Linking**: Updating URL anchors (e.g., `#Genesis1:1`) during scroll enables bookmarking and sharing specific verses even within an infinite list.
- **Smooth Scrolling**: `scrollIntoView` behavior is essential for search-to-verse navigation within a loaded list.
