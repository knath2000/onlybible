# Verse Selector Issue Analysis

## Problem Description
The verse selector (versículo selector) stays empty even though the book (libro) and chapter (capítulo) have been selected.

## Root Cause Analysis

### Issue Location: `lib/context/BibleContext.tsx`

**Lines 159-174**: The `updateChapters` useEffect only updates the `chapters` array but **never updates the `verses` array**.

```typescript
// Update chapters when book changes
React.useEffect(() => {
  const updateChapters = async () => {
    if (state.currentBook) {
      try {
        const chapters = await bibleService.getChaptersInBook(state.currentBook);
        const chapterArray = Array.from({ length: chapters }, (_, i) => i + 1);
        dispatch({ type: 'SET_CHAPTERS', payload: chapterArray });
        // ❌ MISSING: dispatch({ type: 'SET_VERSES', payload: verseArray });
      } catch (error) {
        console.error('Error loading chapters:', error);
      }
    }
  };

  updateChapters();
}, [state.currentBook]);
```

### Missing Logic for Verse Population

1. **When Book Changes**: Only chapters are loaded, verses remain empty `[]`
2. **When Chapter Changes**: No useEffect exists to update verses based on the selected chapter
3. **Initial State**: `verses: []` (empty array)

### Expected Behavior vs Actual Behavior

| Action | Expected | Actual |
|--------|----------|--------|
| Select Book | Chapters load, verses should load for chapter 1 | Chapters load, verses remain empty |
| Change Chapter | Verses should update for selected chapter | Verses remain empty |
| Initial Load | Should show verses for Génesis 1 | Verses array is empty |

## Solution Required

### 1. Add Verse Population Logic

**When Book Changes**:
- Load chapters for the book
- Load verses for the first chapter (since chapter defaults to 1)

**When Chapter Changes**:
- Load verses for the selected chapter

### 2. Missing State Updates

The BibleContext needs to:
1. Dispatch `SET_VERSES` action when chapters change
2. Dispatch `SET_VERSES` action when verses change
3. Maintain verse count for each chapter

### 3. Missing Chapter-to-Verse Mapping

The current system only knows:
- Total chapters per book (from `mockChapters`)
- But doesn't know how many verses are in each chapter

## Implementation Plan

### Step 1: Update Mock Data Structure
Modify `lib/services/mockBibleData.ts` to include verse counts per chapter:

```typescript
// Current structure only has chapter counts
export const mockChapters: Record<string, number> = {
  'Génesis': 50,  // Only total chapters
  // ...
};

// Need to add verse counts per chapter
export const mockChapterVerses: Record<string, Record<number, number>> = {
  'Génesis': {
    1: 31,  // Chapter 1 has 31 verses
    2: 25,  // Chapter 2 has 25 verses
    // ...
  },
  // ...
};
```

### Step 2: Update BibleService
Add method to get verses in chapter:

```typescript
async getVersesInChapter(book: string, chapter: number): Promise<number> {
  if (this.useMockData) {
    return mockChapterVerses[book]?.[chapter] || 30;
  } else {
    // API would return verse count
    return mockChapterVerses[book]?.[chapter] || 30;
  }
}
```

### Step 3: Update BibleContext
Add useEffect for chapter changes and verse population:

```typescript
// Update verses when chapter changes
React.useEffect(() => {
  const updateVerses = async () => {
    if (state.currentBook && state.currentChapter) {
      try {
        const verses = await bibleService.getVersesInChapter(state.currentBook, state.currentChapter);
        const verseArray = Array.from({ length: verses }, (_, i) => i + 1);
        dispatch({ type: 'SET_VERSES', payload: verseArray });
      } catch (error) {
        console.error('Error loading verses:', error);
      }
    }
  };

  updateVerses();
}, [state.currentBook, state.currentChapter]);
```

### Step 4: Initialize Verses on Book Change
Update the book change useEffect to also load verses:

```typescript
React.useEffect(() => {
  const updateChapters = async () => {
    if (state.currentBook) {
      try {
        const chapters = await bibleService.getChaptersInBook(state.currentBook);
        const chapterArray = Array.from({ length: chapters }, (_, i) => i + 1);
        dispatch({ type: 'SET_CHAPTERS', payload: chapterArray });
        
        // Also load verses for the current chapter (usually 1)
        const verses = await bibleService.getVersesInChapter(state.currentBook, state.currentChapter);
        const verseArray = Array.from({ length: verses }, (_, i) => i + 1);
        dispatch({ type: 'SET_VERSES', payload: verseArray });
      } catch (error) {
        console.error('Error loading chapters:', error);
      }
    }
  };

  updateChapters();
}, [state.currentBook]);
```

## Files That Need Modification

1. **`lib/services/mockBibleData.ts`** - Add verse counts per chapter
2. **`lib/services/BibleService.ts`** - Add `getVersesInChapter` method
3. **`lib/context/BibleContext.tsx`** - Add verse population logic
4. **`components/BibleReader.tsx`** - May need updates for verse selection

## Impact Assessment

### Critical Impact
- **User Experience**: Users cannot select verses, breaking core functionality
- **Navigation**: Verse navigation buttons won't work properly
- **Reading Flow**: Users cannot read specific verses

### Technical Impact
- **State Management**: Incomplete state updates
- **Data Flow**: Missing verse data propagation
- **Component Rendering**: Verse selector renders empty options

## Priority: 🔴 **CRITICAL**

This is a blocking issue that prevents core functionality from working. The verse selector is essential for the Bible reading experience.

---

**Analysis Complete**: December 4, 2025  
**Issue**: Missing verse population logic in BibleContext  
**Solution**: Add verse count data and population effects