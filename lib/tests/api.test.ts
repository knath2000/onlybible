import { BibleService, CacheService } from '../services';

describe('BibleService', () => {
  let bibleService: BibleService;
  let cacheService: CacheService;

  beforeEach(() => {
    cacheService = new CacheService();
    bibleService = new BibleService(cacheService);
  });

  test('should initialize with correct API URL', () => {
    expect(bibleService).toBeInstanceOf(BibleService);
  });

  test('should have cache service', () => {
    expect(bibleService).toHaveProperty('cache');
    expect(bibleService['cache']).toBeInstanceOf(CacheService);
  });

  test('should get available books', async () => {
    const books = await bibleService.getAvailableBooks();
    expect(Array.isArray(books)).toBe(true);
    expect(books.length).toBeGreaterThan(0);
    expect(books[0]).toBe('Génesis');
  });

  test('should get chapters for a book', async () => {
    const chapters = await bibleService.getChaptersInBook('Génesis');
    expect(typeof chapters).toBe('number');
    expect(chapters).toBeGreaterThan(0);
  });
});

describe('CacheService', () => {
  let cacheService: CacheService;

  beforeEach(() => {
    cacheService = new CacheService();
  });

  test('should initialize with empty cache', () => {
    const stats = cacheService.getCacheStats();
    expect(stats.size).toBe(0);
    expect(stats.keys.length).toBe(0);
  });

  test('should set and get cached data', () => {
    cacheService.setCachedData('test-key', { value: 'test' }, 60);
    const data = cacheService.getCachedData('test-key');
    expect(data).toEqual({ value: 'test' });
  });

  test('should return null for expired cache', () => {
    cacheService.setCachedData('expired-key', { value: 'expired' }, 0.1);
    // Small delay to ensure expiration
    setTimeout(() => {
      const data = cacheService.getCachedData('expired-key');
      expect(data).toBeNull();
    }, 150);
  });

  test('should clear cache', () => {
    cacheService.setCachedData('key1', { value: 'data1' }, 60);
    cacheService.setCachedData('key2', { value: 'data2' }, 60);
    cacheService.clearCache();
    const stats = cacheService.getCacheStats();
    expect(stats.size).toBe(0);
  });
});