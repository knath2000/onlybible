# Technical Context: Development Environment

## Technologies Used
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **UI**: React with Tailwind CSS
- **State**: React Context API with useReducer
- **API**: Fetch API with caching
- **Design**: Glassmorphic CSS

## External APIs (No Keys Required)

### Spanish Bible API
- **Provider**: biblia-api.vercel.app
- **Version**: RVR60 (Reina-Valera 1960)
- **Endpoint**: `https://biblia-api.vercel.app/api/v1/{book}/{chapter}/{verse}`
- **Format**: JSON with `text` field
- **Rate Limit**: None
- **API Key**: Not required

### English Bible API
- **Provider**: bible-api.com
- **Version**: KJV (King James Version)
- **Endpoint**: `https://bible-api.com/{book}+{chapter}:{verse}?translation=kjv`
- **Format**: JSON with `text`, `reference`, `translation_name` fields
- **Rate Limit**: None
- **API Key**: Not required

## API Routes

| Route | Purpose | External API |
|-------|---------|--------------|
| `/api/bible` | Spanish verses (RVR60) | biblia-api.vercel.app |
| `/api/bible/english` | English verses (KJV) | bible-api.com |
| `/api/translate/word` | Word translation fallback | api.mymemory.translated.net |
| `/api/tts` | Verse audio playback (MP3) | Azure Speech (configurable) |

## Development Setup
- Node.js 20+
- npm/yarn/pnpm
- VSCode with ESLint
- TypeScript 5+
- Tailwind CSS 4+

## Technical Constraints
- Free Bible API limitations (verse-level only)
- Browser compatibility
- Mobile performance
- Offline capabilities (future)
- Unicode handling for Spanish accents

## Key Technical Patterns

### Unicode Normalization
```typescript
// Required for Spanish book names with accents
function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}
```

### Caching Strategy
- Spanish verses: 24-hour cache
- English verses: 24-hour cache
- Word translations: 1-hour cache (dictionary), 24-hour cache (API)
- Book/chapter metadata: Long-term cache
- API word translations: 24-hour cache
- TTS audio: not cached by default (provider-dependent); can add hash-based 24-hour cache if needed

### Stacked Verse Window
- Fetch a small window (e.g., ±2 verses) around the current verse for vertical stacking
- Prefetch English translations for the window to enable instant toggle/hover

### Audio Control
- Per-verse TTS buttons use the verse text
- Single-active audio: pause/reset any existing audio before starting a new one

### State Management
```typescript
interface BibleState {
  isLoading: boolean;      // Verse fetching
  isTranslating: boolean;  // Translation fetching
  verseText: string;       // Spanish verse
  translatedText: string;  // English verse
  showTranslation: boolean;
  // ... navigation state
}
```

## Dependencies
- next: 16.0.7
- react: 19.2.0
- react-dom: 19.2.0
- tailwindcss: ^4
- typescript: ^5

## Tool Usage Patterns
- ESLint for code quality
- TypeScript for type safety
- Tailwind for styling
- Next.js API routes for proxy/CORS handling
- Fetch API with AbortSignal for timeouts

## Build and Deployment
- `npm run dev` for development
- `npm run build` for production
- `npm run start` to run
- Vercel deployment ready (no environment variables needed)

## File Structure
```
app/
├── api/
│   └── bible/
│       ├── route.ts          # Spanish Bible API proxy
│       └── english/
│           └── route.ts      # English Bible API proxy
├── page.tsx                  # Main page
└── layout.tsx               # Root layout

components/
├── SpanishBibleReader.tsx   # Main reader component
├── WordTranslationTooltip.tsx
├── LoadingSpinner.tsx
└── ui/                      # Glassmorphic UI components

lib/
├── api.ts                   # Service exports
├── context/
│   └── BibleContext.tsx     # Global state
└── services/
    ├── BibleService.ts      # Spanish Bible operations
    ├── TranslationService.ts # Translation operations
    └── CacheService.ts      # Caching layer
```