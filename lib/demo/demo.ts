/**
 * Bible Reading App Demo
 *
 * This file demonstrates the core functionality of the Bible reading app
 * with Spanish translation features.
 */

import { bibleService, cacheService, translationService } from '../api';

// Initialize services
// Use the singleton instances from api.ts

/**
 * Demo: Fetch a Bible verse
 */
async function demoFetchVerse() {
  console.log('📖 Fetching Genesis 1:1...');

  try {
    const verse = await bibleService.fetchVerse('Génesis', 1, 1);
    console.log('✅ Verse fetched:', verse.reference);
    console.log('📝 Text:', verse.text);
    return verse;
  } catch (error) {
    console.error('❌ Error fetching verse:', error);
    return null;
  }
}

/**
 * Demo: Translate a verse
 */
async function demoTranslateVerse(verseText: string) {
  console.log('🌐 Translating verse...');

  try {
    const result = await translationService.translateText(verseText);
    console.log('✅ Translation:', result.translatedText);
    return result;
  } catch (error) {
    console.error('❌ Translation error:', error);
    return null;
  }
}

/**
 * Demo: Translate individual words
 */
async function demoTranslateWords(words: string[]) {
  console.log('🔤 Translating individual words...');

  for (const word of words.slice(0, 5)) { // Translate first 5 words
    try {
      const translation = await translationService.translateWord(word);
      console.log(`✅ "${word}" → "${translation}"`);
    } catch (error) {
      console.error(`❌ Error translating "${word}":`, error);
    }
  }
}

/**
 * Demo: Get available books
 */
async function demoGetBooks() {
  console.log('📚 Getting available books...');

  try {
    const books = await bibleService.getAvailableBooks();
    console.log('✅ Available books:', books.slice(0, 10).join(', ') + '...');
    return books;
  } catch (error) {
    console.error('❌ Error getting books:', error);
    return [];
  }
}

/**
 * Demo: Cache functionality
 */
function demoCache() {
  console.log('💾 Testing cache functionality...');

  // Set cache data
  cacheService.setCachedData('test-key', { value: 'cached data' }, 60);
  console.log('✅ Data cached');

  // Get cache data
  const cached = cacheService.getCachedData('test-key');
  console.log('📥 Retrieved from cache:', cached);

  // Get cache stats
  const stats = cacheService.getCacheStats();
  console.log('📊 Cache stats:', stats.size, 'items cached');

  // Clear cache
  cacheService.clearCache();
  console.log('🧹 Cache cleared');
}

/**
 * Run all demos
 */
async function runAllDemos() {
  console.log('🚀 Starting Bible Reading App Demo...');
  console.log('====================================');

  // Demo cache
  demoCache();
  console.log();

  // Demo books
  await demoGetBooks();
  console.log();

  // Demo verse fetching and translation
  const verse = await demoFetchVerse();
  if (verse) {
    console.log();
    await demoTranslateVerse(verse.text);

    console.log();
    const words = verse.text.split(' ').slice(0, 5);
    await demoTranslateWords(words);
  }

  console.log();
  console.log('🎉 Demo completed!');
  console.log('====================================');
}

// Run demos if this file is executed directly
if (require.main === module) {
  runAllDemos().catch(console.error);
}

export {
  demoFetchVerse,
  demoTranslateVerse,
  demoTranslateWords,
  demoGetBooks,
  demoCache,
  runAllDemos
};