# System Patterns: Technical Architecture

## System Architecture
- Next.js App Router pattern
- Dual API proxy routes (Spanish + English Bible)
- Service layer for API integration
- Component-based UI structure
- State management with React Context + useReducer + TanStack Query
- Cache-first data strategy with 24-hour TTL

## Key Technical Decisions
1. **Dual Bible API**: Separate routes for Spanish (RVR60) and English (KJV)
2. **Unicode Normalization**: NFD normalization for Spanish accented characters
3. **Real Bible Translations**: Fetch actual Bible verses instead of machine translation
4. **Caching Strategy**: Multi-level caching (verse, translation, word, API translations)
5. **Error Handling**: Comprehensive error boundaries with fallback dictionary
6. **UI Framework**: Glassmorphic design with Tailwind CSS
7. **State Management**: React Context + useReducer with separate loading states; TanStack Query for infinite scrolling
8. **Context-Aware Translation**: Word translations are disambiguated using the full verse context
9. **Word Alignment**: Visual mapping with SVG Bezier curves connecting aligned words
10. **API Fallback**: MyMemory API integration for unknown words when dictionary fails
11. **Right-to-Left Parsing**: Parse passage strings from end to handle multi-word book names
12. **Pre-Normalized Dictionary**: Normalize dictionary keys at construction time for accent handling
13. **Cloud TTS Proxy**: `/api/tts` Azure Speech route returning MP3 for verse audio playback
14. **Infinite Scrolling**: `useInfiniteQuery` + Intersection Observer for seamless verse loading
15. **Relative Origin Fetching**: Services call relative `/api/...` paths to avoid mixed-content in production.
16. **CORS-Friendly Proxies**: API routes export `OPTIONS` with `Access-Control-Allow-*` headers to support cross-origin dev/testing.
17. **Range Clamping for Infinite Lists**: Enforce chapter boundaries server-side (chapter slicing) plus client-side sanitization; never render out-of-range verses and return `[]` past chapter end so infinite queries stop cleanly.
18. **Search-to-Anchor Reliability**: Scroll to anchor IDs without `#`, and keep requesting more pages until the target anchor exists, then center it smoothly.
19. **TTS Guard Rails**: `/api/tts` surfaces `configured: false` with hints when env vars are missing; UI shows friendly “audio not available” instead of generic errors.
20. **Themed Headers & Cards**: Top bar and verse cards use glassmorphic gold/purple gradients, serif italics, and underline glows to align with the Luminous Verses aesthetic.
21. **Query Parameter Mode Detection**: Use `request.nextUrl.searchParams.has()` instead of defaulted values to distinguish missing vs present parameters for API route logic.
22. **Chapter-Slice Range Fetching**: Fetch entire chapter once, then slice `text[]` array for range requests instead of N parallel single-verse calls.
23. **Meta Endpoint for Verse Counts**: Separate `/api/bible?meta=1` endpoint returns authoritative chapter metadata to eliminate hardcoded verse count tables.
24. **Bulk Translation Pattern**: When enabling translations, fetch English for entire loaded range in one batch request instead of per-verse calls.
25. **Response Shape Alignment**: Ensure proxy routes return consistent structures matching upstream APIs to avoid parsing mismatches.
26. **Authoritative Pagination Stop**: `useInfiniteQuery.getNextPageParam` should stop based on known chapter boundaries (chapterVerseCount) instead of relying on `lastPage.length`.
27. **Query Cache Versioning**: Include `chunkSize` and a schema/version token in the infinite query key to prevent stale cached pages from resurfacing after behavior changes.

## Design Patterns

### Service Pattern
```
BibleService → /api/bible → biblia-api.vercel.app (RVR60)
TranslationService → /api/bible/english → bible-api.com (KJV)
TranslationService → /api/translate/word → api.mymemory.translated.net (Fallback)
```

### Normalization Pattern
```typescript
// Always normalize before lookups
const normalized = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
```

### Fallback Pattern
```typescript
try {
  return await fetchEnglishVerse(); // Primary: Bible API
} catch {
  return translateWithDictionary(); // Fallback: Local dictionary
}
```

### Separate Loading States
```typescript
isLoading: boolean;      // Verse operations
isTranslating: boolean;  // Translation operations
```

### Infinite Scroll Pattern (New)
```typescript
// useInfiniteQuery handles pagination logic
const { data, fetchNextPage } = useInfiniteQuery({
  queryKey: ['verses', book, chapter],
  queryFn: ({ pageParam }) => fetchVerseRange(..., pageParam),
  getNextPageParam: (lastPage, allPages) => {
    // Return undefined to stop fetching when next page exceeds chapterVerseCount
    const nextStart = allPages.length * chunkSize + 1;
    return nextStart > lastPage.chapterVerseCount ? undefined : allPages.length + 1;
  }
});

// Intersection Observer triggers fetch
const observer = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting && hasNextPage) fetchNextPage();
});
```

### Stacked Verse Window Pattern (Legacy/Refactored)
*Replaced by Infinite Scroll List, but logic remains for initial fetches.*
- Fetch chunks (default 20 verses) instead of small windows.
- Prefetch English translations for the chunk to enable instant toggle/hover.

### Single-Active Audio Pattern
- Each verse card has its own TTS button using the verse text
- Before playing new audio, pause/reset any existing `Audio` instance so only one plays at a time

### Settings-Driven Autoplay Pattern
- Store autoplay preference in localStorage (`bible-app-autoplay-enabled`)
- Toggle lives in Settings; when enabled, playing a verse auto-continues to the next
- If user disables the toggle, stop autoplay immediately and pause current audio
- Autoplay advances on `onended`, respecting the preference flag

### Toggle with Cache
```typescript
if (showTranslation) toggle();           // Hide if showing
else if (translatedText) toggle();       // Show cached
else fetchAndShow();                      // Fetch new
```

### Background Fetch Pattern
```typescript
// In fetchVerse (Verse Loaded)
dispatch(SET_VERSE_TEXT);
// Immediately trigger translation fetch silently
fetchEnglishVerse().then(data => dispatch(SET_TRANSLATED_TEXT));
// This ensures context is ready for word hover tooltips immediately
```

## Component Relationships
```
ClientProviders (QueryClient)
    └── BibleProvider (Context + TanStack Query)
            └── SpanishBibleReader
                    ├── Header (Book/Chapter Selectors, Search, Settings)
                    └── InfiniteVerseList
                            └── VerseItem (Repeated)
                                    ├── WordTranslationTooltip
                                    ├── AlignmentOverlay
                                    └── Audio/Translate Controls
```

## Data Flow

### Verse Fetching (Infinite)
```
User selects book/chapter → BibleContext (useInfiniteQuery)
    → BibleService.fetchVerseRange()
    → /api/bible?startVerse=...&endVerse=...
    → /api/bible range mode fetches upstream chapter once + slices `text[]`
    → biblia-api.vercel.app/api/v1/{book}/{chapter}
    → TanStack Query Cache
    → BibleContext State (infiniteVerses)
    → UI Update
```

### Translation Flow
```
User clicks "Traducir Versículo"
    → translateVerse()
    → Check: showTranslation? → TOGGLE_TRANSLATION (hide)
    → dispatch SET_TRANSLATING
    → TranslationService.fetchEnglishRange(minLoadedVerse, maxLoadedVerse) (prime per-verse caches)
    → /api/bible/english?startVerse=...&endVerse=...
    → bible-api.com (KJV) using upstream `verses[]`
    → VerseItem fetchEnglishVerse() hits cache; alignment uses cached text
    → dispatch TOGGLE_TRANSLATION (show)
```

### Word Translation Flow
```
User hovers over word
    → WordTranslationTooltip.handleMouseEnter()
    → translateWord()
    → TranslationService.translateWord(word, contextVerse)
    → Dictionary lookup (normalized) -> candidates[]
    → Fuzzy Match: Check which candidate exists in contextVerse
    → Return best match
    → Show tooltip
```

## Critical Implementation Paths
1. **Verse Display**: API Route → Service → TanStack Query → Context → Infinite List
2. **Translation**: Button → Context Method → Service → API → Context → UI
3. **Error Handling**: API Error → Fallback Dictionary → User Notification
4. **Caching**: Check Cache → Fetch if Missing → Store with TTL → Return
5. **Word Disambiguation**: Dictionary Candidates + Verse Context → Best Translation

## API Route Patterns

### Spanish Bible Route (`/api/bible`)
```typescript
GET /api/bible?book=Génesis&chapter=1&verse=1
    → normalizeText("Génesis") → "genesis"
    → fetch(biblia-api.vercel.app/api/v1/genesis/1/1)
    → Return JSON { verses: [{ verse, text }], reference }

GET /api/bible?book=Génesis&chapter=1&startVerse=1&endVerse=20
    → fetch(biblia-api.vercel.app/api/v1/genesis/1)
    → slice `text[]` and return JSON { verses: [{ verse, text }], chapterVerseCount }

GET /api/bible?book=Génesis&chapter=1&meta=1
    → fetch(biblia-api.vercel.app/api/v1/genesis/1)
    → Return JSON { chapterVerseCount }
```

### English Bible Route (`/api/bible/english`)
```typescript
GET /api/bible/english?book=Génesis&chapter=1&verse=1
    → normalizeText("Génesis") → "genesis"
    → spanishToEnglishBooks["genesis"] → "Genesis"
    → fetch(bible-api.com/Genesis+1:1?translation=kjv)
    → Return JSON { verses: [{ verse, text }], reference }
```

### Word Alignment Pattern
```
User hovers word → setHoveredWordIndex
    → computeAlignment(spanishText, englishText)
    → Dictionary lookup + Positional heuristic
    → Get target English word indices
    → Calculate bounding boxes (getBoundingClientRect)
    → Render AlignmentOverlay with Bezier curves
```

### API Fallback Pattern
```
translateWord(word)
    → Check normalizedDictionary
    → If not found, check wordDictionary
    → If still not found, fetchWordTranslation(word)
    → Call /api/translate/word → MyMemory API
    → Cache result and add to dictionary
    → Return translation
```

### Right-to-Left Parsing Pattern
```
Parse "2 Reyes 1:1"
    → Find last ':' → verse = 1
    → Extract "2 Reyes 1"
    → Match last number → chapter = 1
    → Everything before → book = "2 Reyes"
```

## Future Architecture Considerations
- **Alignment Accuracy**: Improve heuristic matching for complex verse structures
- **Offline-first**: Service Worker + IndexedDB for verse caching
- **Multiple Versions**: Support ESV, NIV, NVI in addition to KJV/RVR60
- **Chapter View**: Display full chapters with verse-by-verse translation
- **Search**: Full-text search across both Spanish and English
- **User Preferences**: Remember last read position, favorite verses
- **Progressive Web App**: Installable with offline support
