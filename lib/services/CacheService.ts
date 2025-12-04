export class CacheService {
  private cache: Map<string, { data: any, expires: number }> = new Map();

  getCachedData(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (cached.expires < Date.now()) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  setCachedData(key: string, data: any, ttl: number): void {
    const expires = Date.now() + (ttl * 1000);
    this.cache.set(key, { data, expires });
  }

  clearCache(): void {
    this.cache.clear();
  }

  getCacheStats(): { size: number, keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}