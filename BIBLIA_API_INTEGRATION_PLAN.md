# Biblia.com API Integration Plan

## Current Issue Analysis

The current implementation is using the wrong API endpoint (`https://biblia-api.vercel.app/api/v1`) which is causing 500 errors. We need to switch to the official Biblia.com API with proper API key authentication.

## Required Changes

### 1. Environment Setup
**File**: `.env.local` (NEW)
```env
BIBLIA_API_KEY=23a0d5fbb123f4ef5d844378e7b4ef5d
```

### 2. Update API Route
**File**: `app/api/bible/route.ts` (MODIFY)

Replace the current implementation with Biblia.com API:
- Use `https://api.biblia.com/v1/bible/content/` endpoint
- Support both HTML and text formats
- Handle API key authentication
- Support Reina-Valera 1960 (RVR60) version

### 3. Update BibleService
**File**: `lib/services/BibleService.ts` (MODIFY)

Update the API calls to use the new Biblia.com format:
- Change URL structure: `?bible=RVR60&passage=Juan+3:16`
- Handle HTML response format
- Parse HTML to extract text content
- Maintain fallback to mock data

### 4. Update Mock Data
**File**: `lib/services/mockBibleData.ts` (ENHANCE)

Add more comprehensive mock data for better fallback experience:
- Expand verse content for key passages
- Add more books and chapters
- Ensure verse counts are accurate

## Implementation Steps

### Step 1: Create Environment File
Create `.env.local` with the provided API key.

### Step 2: Update API Route
Replace the current API route implementation to use Biblia.com:
```typescript
// New endpoint structure
GET /api/bible?bible=RVR60&passage=Juan+3:16&format=text
```

### Step 3: Update BibleService
Modify the fetch methods to:
- Use new URL format
- Handle HTML responses
- Extract text from HTML
- Maintain error handling and fallback

### Step 4: Test Integration
- Verify API key works
- Test verse fetching
- Test chapter fetching
- Verify fallback works when API fails

## Benefits of This Approach

1. **Official API**: Biblia.com is the official source for Spanish Bible content
2. **Proper Authentication**: API key prevents abuse and ensures reliability
3. **Reina-Valera 1960**: Direct access to the requested translation
4. **Error Handling**: Better error responses and fallback mechanisms
5. **Performance**: Caching and proper API limits

## Fallback Strategy

When Biblia.com API fails:
1. Return error response from API route
2. BibleService detects error and falls back to mock data
3. Mock data provides basic functionality
4. User experience remains functional

## Files to Modify

1. **`.env.local`** - Add API key (NEW)
2. **`app/api/bible/route.ts`** - Update API implementation
3. **`lib/services/BibleService.ts`** - Update service methods
4. **`lib/services/mockBibleData.ts`** - Enhance mock data (optional)

## Expected Outcome

After implementing these changes:
- ✅ Verse selector will populate correctly
- ✅ Bible content will load from official source
- ✅ Spanish Reina-Valera 1960 text will display
- ✅ Fallback to mock data when API unavailable
- ✅ No more 500 errors
- ✅ Proper API key authentication

## Next Steps

Ready to implement these changes in Code mode:
1. Create `.env.local` with API key
2. Update API route to use Biblia.com
3. Update BibleService to handle new format
4. Test the integration
5. Verify verse selector works

---

**Implementation Ready**: December 4, 2025  
**API Key Provided**: 23a0d5fbb123f4ef5d844378e7b4ef5d  
**Target Version**: Reina-Valera 1960 (RVR60)