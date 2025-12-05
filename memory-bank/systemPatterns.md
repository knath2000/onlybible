# System Patterns: Technical Architecture

## System Architecture
- Next.js App Router pattern
- Dual API proxy routes (Spanish + English Bible)
- Service layer for API integration
- Component-based UI structure
- State management with React Context + useReducer
- Cache-first data strategy with 24-hour TTL

## Key Technical Decisions
1. **Dual Bible API**: Separate routes for Spanish (RVR60) and English (KJV)
2. **Unicode Normalization**: NFD normalization for Spanish accented characters
3. **Real Bible Translations**: Fetch actual Bible verses instead of machine translation
4. **Caching Strategy**: Multi-level caching (verse, translation, word)
5. **Error Handling**: Comprehensive error boundaries with fallback dictionary
6. **UI Framework**: Glassmorphic design with Tailwind CSS
7. **State Management**: React Context + useReducer with separate loading states
8. **Context-Aware Translation**: Word translations are disambiguated using the full verse context

## Design Patterns

### Service Pattern
```
BibleService → /api/bible → biblia-api.vercel.app (RVR60)
TranslationService → /api/bible/english → bible-api.com (KJV)
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
BibleProvider (Context)
    └── SpanishBibleReader
            ├── Book/Chapter/Verse Selectors
            ├── Navigation Buttons
            ├── Translate Button → translateVerse()
            ├── Test Connection Button
            ├── Spanish Verse Display
            │       └── WordTranslationTooltip (per word)
            ├── English Translation Display (KJV)
            └── Debug Info Panel
```

## Data Flow

### Verse Fetching
```
User selects verse → setBook/setChapter/setVerse
    → useEffect triggers fetchVerse()
    → BibleService.fetchVerse()
    → /api/bible?passage=...
    → biblia-api.vercel.app
    → dispatch SET_VERSE_TEXT
    → Clear translatedText & showTranslation
    → [Background] TranslationService.fetchEnglishVerse()
    → [Background] dispatch SET_TRANSLATED_TEXT (Silent)
```

### Translation Flow
```
User clicks "Traducir Versículo"
    → translateVerse()
    → Check: showTranslation? → TOGGLE_TRANSLATION (hide)
    → Check: translatedText? → TOGGLE_TRANSLATION (show cached)
    → dispatch SET_TRANSLATING (if not cached)
    → TranslationService.translateVerse()
    → /api/bible/english?book=...
    → bible-api.com (KJV)
    → dispatch SET_TRANSLATED_TEXT
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
1. **Verse Display**: API Route → Service → Context → Component
2. **Translation**: Button → Context Method → Service → API → Context → UI
3. **Error Handling**: API Error → Fallback Dictionary → User Notification
4. **Caching**: Check Cache → Fetch if Missing → Store with TTL → Return
5. **Word Disambiguation**: Dictionary Candidates + Verse Context → Best Translation

## API Route Patterns

### Spanish Bible Route (`/api/bible`)
```typescript
GET /api/bible?passage=Génesis+1:1
    → normalizeText("Génesis") → "genesis"
    → bookNameMapping["genesis"] → "genesis"
    → fetch(biblia-api.vercel.app/api/v1/genesis/1/1)
    → Return JSON { text, reference, translation }
```

### English Bible Route (`/api/bible/english`)
```typescript
GET /api/bible/english?book=Génesis&chapter=1&verse=1
    → normalizeText("Génesis") → "genesis"
    → spanishToEnglishBooks["genesis"] → "Genesis"
    → fetch(bible-api.com/Genesis+1:1?translation=kjv)
    → Return JSON { text, reference, translation }
```

## Future Architecture Considerations
- **Word Alignment**: Map Spanish words to English equivalents using verse structure
- **Offline-first**: Service Worker + IndexedDB for verse caching
- **Multiple Versions**: Support ESV, NIV, NVI in addition to KJV/RVR60
- **Chapter View**: Display full chapters with verse-by-verse translation
- **Search**: Full-text search across both Spanish and English
- **User Preferences**: Remember last read position, favorite verses
- **Progressive Web App**: Installable with offline support
