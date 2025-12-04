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

## Key Takeaways

1. **API Selection Matters**: Verify API endpoints and CORS policies early
2. **Mock Data is Essential**: Comprehensive mock data enables smooth development
3. **Error Handling is Critical**: Robust error handling prevents app crashes
4. **Progressive Enhancement**: Build core features first, enhance later
5. **Documentation Drives Success**: Good docs reduce future maintenance costs
6. **User Experience First**: Design for usability before technical perfection