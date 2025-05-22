import { useState, useCallback } from 'react';

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

interface Cache<T> {
  [key: string]: CacheItem<T>;
}

export function useCache<T>(expirationTime = 5 * 60 * 1000) { // 기본 5분
  const [cache, setCache] = useState<Cache<T>>({});

  const get = useCallback((key: string): T | null => {
    const item = cache[key];
    if (!item) return null;

    const now = Date.now();
    if (now - item.timestamp > expirationTime) {
      // 캐시 만료
      setCache(prev => {
        const { [key]: _, ...rest } = prev;
        return rest;
      });
      return null;
    }

    return item.data;
  }, [cache, expirationTime]);

  const set = useCallback((key: string, data: T) => {
    setCache(prev => ({
      ...prev,
      [key]: {
        data,
        timestamp: Date.now(),
      },
    }));
  }, []);

  const clear = useCallback(() => {
    setCache({});
  }, []);

  return { get, set, clear };
} 