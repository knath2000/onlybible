# Bible Reading App 404 Error Analysis and Solution Plan
# December 4, 2025

## Executive Summary

The Bible Reading App is experiencing 404 errors when deployed on Vercel due to incorrect API endpoint configuration. This document provides a comprehensive analysis of the root causes and a detailed solution plan based on Perplexity MCP research.

## Root Cause Analysis

### 1. Invalid API Endpoint URL

**Current Issue**: The app is using `https://biblia-api.vercel.app/api/v1` which is causing 404 errors.

**Root Cause**: This is a third-party proxy endpoint that is either:
- No longer active/maintained
- Not publicly available
- Incorrect URL format for the intended API

**Evidence**: Found in `lib/services/BibleService.ts` line 21:
```typescript
private apiUrl = 'https://biblia-api.vercel.app/api/v1';
```

### 2. Incorrect API Integration Pattern

**Current Issue**: The service is trying to call the external API directly instead of using the Next.js API route proxy.

**Root Cause**: The BibleService is bypassing the proper API route (`app/api/bible/route.ts`) and attempting direct external calls, which fail due to:
- CORS restrictions
- Domain restrictions
- Invalid endpoint

### 3. Environment Variable Configuration

**Current Issue**: Potential missing or incorrect environment variables in production.

**Root Cause**: The Vercel deployment may not have:
- Proper `BIBLIA_API_KEY` configuration
- Correct domain registration with Biblia.com
- Environment variables properly set

### 4. Domain Restrictions

**Current Issue**: The Biblia.com API key is domain-restricted.

**Root Cause**: The API key is registered to specific domains and rejects requests from unauthorized origins, including Vercel preview deployments.

## Detailed Solution Plan

### Phase 1: Fix API Endpoint Configuration

**File**: `lib/services/BibleService.ts`
**Lines**: 21, 36-37

**Current Code**:
```typescript
private apiUrl = 'https://biblia-api.vercel.app/api/v1';

// In fetchVerse method:
const passage = `${book}+${chapter}:${verse}`;
const response = await fetch(`/api/bible?bible=RVR60&passage=${encodeURIComponent(passage)}&format=text`);
```

**Issues Identified**:
1. Wrong base URL (`biblia-api.vercel.app` instead of `api.biblia.com`)
2. Incorrect URL construction logic
3. Missing proper API key usage

**Solution**:
```typescript
// Update to use correct API endpoint
private apiUrl = 'https://api.biblia.com/v1';

// Update fetchVerse method to use proper URL format
async fetchVerse(book: string, chapter: number, verse: number): Promise<BibleVerse> {
  const cacheKey = `verse-${book}-${chapter}-${verse}`;
  const cached = this.cache.getCachedData(cacheKey);
  if (cached) return cached;

  try {
    // Use correct Biblia.com API format
    const passage = `${book}+${chapter}:${verse}`;
    const response = await fetch(`/api/bible?bible=RVR60&passage=${encodeURIComponent(passage)}&format=text`);

    // Rest of existing error handling...
  } catch (error) {
    // Existing error handling...
  }
}
```

### Phase 2: Implement Proper API Route Integration

**File**: `app/api/bible/route.ts`

**Current Status**: The API route is correctly implemented but the service isn't using it properly.

**Solution**: Ensure the API route is properly configured and the service uses it correctly.

**Required Configuration**:
```typescript
// Ensure proper environment variable usage
const apiKey = process.env.BIBLIA_API_KEY;

// Use correct Biblia.com API URL format
const apiUrl = `https://api.biblia.com/v1/bible/content/${bibleId}.${format}?passage=${encodeURIComponent(cleanPassage)}&key=${apiKey}`;
```

### Phase 3: Environment Variable Setup

**File**: `.env.local` (NEW)

**Required Configuration**:
```
BIBLIA_API_KEY=your_actual_api_key_from_biblia_com
BIBLIA_API_BASE=https://api.biblia.com/v1
NEXT_PUBLIC_APP_ENV=production
```

**Vercel Configuration**:
1. Add environment variables in Vercel dashboard
2. Register Vercel domain with Biblia.com
3. Ensure domain format includes `https://`

### Phase 4: Comprehensive Error Handling

**File**: `lib/errors/BibleAPIError.ts` (NEW)

**Implementation**:
```typescript
export class BibleAPIError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'BibleAPIError';
  }
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}
```

### Phase 5: Enhanced Service Layer

**File**: `lib/services/bibleService.ts` (NEW)

**Implementation**:
```typescript
import { BibleAPIError, ApiResponse } from '@/lib/errors/BibleAPIError';

interface BibleContentParams {
  passage: string;
  bibleId?: string;
  format?: 'html' | 'text';
}

class BibleService {
  private apiBase = process.env.BIBLIA_API_BASE || 'https://api.biblia.com/v1';
  private apiKey = process.env.BIBLIA_API_KEY;

  constructor() {
    if (!this.apiKey) {
      console.warn('BIBLIA_API_KEY not configured');
    }
  }

  async getContent(params: BibleContentParams): Promise<string> {
    const { passage, bibleId = 'RVR60', format = 'html' } = params;

    // Validation
    if (!passage || passage.trim().length === 0) {
      throw new BibleAPIError(400, 'Passage is required');
    }

    if (!this.apiKey) {
      throw new BibleAPIError(500, 'API key not configured');
    }

    try {
      const url = this.buildUrl(bibleId, passage, format);
      const response = await this.fetchWithRetry(url, 3);

      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      const content = await response.text();

      // Validate response isn't an error page
      if (content.includes('<!DOCTYPE') && content.length < 500) {
        throw new BibleAPIError(
          response.status,
          'Invalid response from Bible API'
        );
      }

      return content;
    } catch (error) {
      this.logError(error, { passage, bibleId, format });
      throw this.normalizeError(error);
    }
  }

  private buildUrl(bibleId: string, passage: string, format: string): string {
    const url = new URL(`${this.apiBase}/bible/content/${bibleId}.${format}`);
    url.searchParams.set('passage', passage);
    url.searchParams.set('key', this.apiKey!);
    return url.toString();
  }

  // Additional methods: fetchWithRetry, handleErrorResponse, normalizeError, logError
}
```

### Phase 6: API Route with Proper Error Handling

**File**: `app/api/bible/content/route.ts` (NEW)

**Implementation**:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { bibleService } from '@/lib/services/bibleService';
import { BibleAPIError, ApiResponse } from '@/lib/errors/BibleAPIError';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const passage = searchParams.get('passage');
    const bibleId = searchParams.get('bible') || 'RVR60';
    const format = (searchParams.get('format') || 'html') as 'html' | 'text';

    // Validate input
    if (!passage) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: {
            code: 'MISSING_PASSAGE',
            message: 'Missing required parameter: passage',
          },
        },
        { status: 400 }
      );
    }

    // Fetch from service
    const content = await bibleService.getContent({
      passage,
      bibleId,
      format,
    });

    // Return content with appropriate headers
    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': `text/${format}; charset=utf-8`,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
```

## Implementation Checklist

### Critical Fixes Required

- [ ] **Fix API Endpoint**: Update `lib/services/BibleService.ts` line 21
- [ ] **Update URL Construction**: Fix passage format in fetch methods
- [ ] **Environment Configuration**: Create `.env.local` with proper API key
- [ ] **Vercel Deployment**: Add environment variables to Vercel dashboard
- [ ] **Domain Registration**: Register Vercel domain with Biblia.com

### Recommended Enhancements

- [ ] **Error Handling**: Implement comprehensive error types and handling
- [ ] **Service Layer**: Create enhanced BibleService with retry logic
- [ ] **API Routes**: Add proper error response handling
- [ ] **Client Components**: Update UI with better error feedback
- [ ] **Testing**: Add comprehensive test coverage

## Testing and Validation

### Local Testing Procedure

1. **Create `.env.local`**:
   ```bash
   echo "BIBLIA_API_KEY=your_test_key" > .env.local
   echo "BIBLIA_API_BASE=https://api.biblia.com/v1" >> .env.local
   ```

2. **Test API Route**:
   ```bash
   curl "http://localhost:3000/api/bible?bible=RVR60&passage=Juan+3:16&format=text"
   ```

3. **Test Service Directly**:
   ```bash
   npm run dev
   # Use the app and verify verse loading works
   ```

### Vercel Deployment Testing

1. **Deploy to Vercel**:
   ```bash
   vercel --prod
   ```

2. **Test API Endpoint**:
   ```bash
   curl "https://your-app.vercel.app/api/bible?bible=RVR60&passage=Juan+3:16&format=text"
   ```

3. **Verify Domain Registration**:
   - Check Biblia.com dashboard
   - Confirm Vercel domain is registered
   - Test with different passage formats

## Alternative Solutions

### If Biblia.com API Continues to Fail

1. **Spanish Bible API** (Free, No Auth):
   - Endpoint: `https://ajphchgh0i.execute-api.us-west-2.amazonaws.com/dev/api`
   - Returns JSON with verses in Spanish (Reina-Valera 1960)

2. **IQ Bible API**:
   - Supports multiple Spanish translations
   - Requires RapidAPI subscription (free tier available)
   - Version IDs: `rv1909` (Reina-Valera 1909)

3. **Fetch.Bible**:
   - Over 1000+ Bible translations
   - Supports multiple formats (HTML, JSON, plain text)
   - Free tier available

## Troubleshooting Guide

### Common Issues and Solutions

1. **401 Unauthorized Error**:
   - **Cause**: API key not recognized or domain not authorized
   - **Solution**: Verify API key in Vercel environment variables and check domain registration

2. **403 Forbidden Error**:
   - **Cause**: Domain restriction blocking the request
   - **Solution**: Add Vercel domain to Biblia.com allowed domains

3. **404 Not Found Error**:
   - **Cause**: Invalid Bible ID or passage format
   - **Solution**: Verify Bible ID is `RVR60` and passage format uses `+` for spaces

4. **500 Internal Server Error**:
   - **Cause**: Server-side issues or network problems
   - **Solution**: Check Vercel logs for detailed error messages

### Debugging Steps

1. **Check Vercel Logs**: Navigate to Vercel project → Deployments → Function logs
2. **Test API Route Directly**: Visit `https://your-app.vercel.app/api/bible?passage=Juan+3:16`
3. **Verify API Key Status**: Confirm key is active at https://api.biblia.com/v1/Users/SignIn
4. **Check Network Tab**: Browser DevTools → Network tab for request/response details

## Implementation Timeline

### Immediate Actions (Today)

- [ ] Fix API endpoint in BibleService
- [ ] Update URL construction logic
- [ ] Create environment configuration
- [ ] Test locally
- [ ] Deploy to Vercel

### Short-term Actions (Next 24-48 hours)

- [ ] Verify domain registration with Biblia.com
- [ ] Test API integration thoroughly
- [ ] Implement error handling enhancements
- [ ] Add comprehensive logging
- [ ] Create user feedback mechanisms

### Long-term Improvements

- [ ] Implement retry logic with exponential backoff
- [ ] Add comprehensive test coverage
- [ ] Create monitoring and analytics
- [ ] Implement fallback API options
- [ ] Add user authentication for premium features

## Success Criteria

✅ **API Integration**: Bible content loads successfully from Biblia.com
✅ **Error Handling**: Comprehensive error detection and user feedback
✅ **Deployment**: Application works correctly on Vercel
✅ **Performance**: Fast response times with proper caching
✅ **User Experience**: Clear error messages and recovery options

## Conclusion

The 404 errors are caused by incorrect API endpoint configuration and missing environment setup. The solution involves:

1. **Fixing the API endpoint** in `lib/services/BibleService.ts`
2. **Updating URL construction** to use proper Biblia.com format
3. **Configuring environment variables** for Vercel deployment
4. **Registering domains** with Biblia.com
5. **Implementing comprehensive error handling**

This plan addresses all identified issues and provides a robust solution for reliable Bible content delivery.

**Status**: READY FOR IMPLEMENTATION
**Next Step**: Switch to Code mode to implement fixes
**Estimated Time**: 1-2 hours for core fixes, additional time for enhancements