import { BibleService } from './services/BibleService';
import { TranslationService } from './services/TranslationService';
import { CacheService } from './services/CacheService';

// Singleton pattern for API services
const cacheService = new CacheService();
const bibleService = new BibleService(cacheService);
const translationService = new TranslationService(bibleService, cacheService);

export {
  bibleService,
  translationService,
  cacheService
};